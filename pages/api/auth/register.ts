import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter } from "@/lib/api-handler";
import { registerSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { setAuthCookies } from "@/lib/cookies";
import { getUserPermissionKeys } from "@/lib/permissions";
import { ConflictError, ApiError } from "@/lib/errors";

async function register(req: NextApiRequest, res: NextApiResponse) {
  const input = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError("An account with this email already exists");

  // STUDENT/TEACHER accounts must link to a profile an admin already
  // created (rollNumber/employeeId are required business fields a generic
  // signup form can't collect), so require the matching key up front.
  let studentToLink: { id: string } | null = null;
  let teacherToLink: { id: string } | null = null;

  if (input.role === "STUDENT") {
    if (!input.rollNumber) throw new ApiError(400, "rollNumber is required to register as a student");
    const student = await prisma.student.findUnique({ where: { rollNumber: input.rollNumber } });
    if (!student) throw new ApiError(404, "No student record found with that roll number");
    if (student.userId) throw new ConflictError("This student already has a login account");
    studentToLink = student;
  }

  if (input.role === "TEACHER") {
    if (!input.employeeId) throw new ApiError(400, "employeeId is required to register as a teacher");
    const teacher = await prisma.teacher.findUnique({ where: { employeeId: input.employeeId } });
    if (!teacher) throw new ApiError(404, "No teacher record found with that employee ID");
    if (teacher.userId) throw new ConflictError("This teacher already has a login account");
    teacherToLink = teacher;
  }

  const role = await prisma.role.findUnique({ where: { key: input.role } });
  if (!role) throw new ApiError(500, `Role ${input.role} is not configured`);

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
      roleId: role.id,
      ...(input.role === "PARENT" ? { parent: { create: {} } } : {}),
      ...(studentToLink ? { student: { connect: { id: studentToLink.id } } } : {}),
      ...(teacherToLink ? { teacher: { connect: { id: teacherToLink.id } } } : {}),
    },
  });

  const payload = { sub: user.id, email: user.email, role: role.key, roleId: role.id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  setAuthCookies(res, accessToken, refreshToken);

  const permissions = await getUserPermissionKeys(role.id);
  const { password: _password, ...safeUser } = user;
  void _password;
  res.status(201).json({ ...safeUser, role, permissions: Array.from(permissions) });
}

export default methodRouter({ POST: register });
