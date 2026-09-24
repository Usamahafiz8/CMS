import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, basePrisma } from "@/lib/db";
import { methodRouter } from "@/lib/api-handler";
import { registerSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/password";
import { issueSession } from "@/lib/session";
import { runWithTenant } from "@/lib/tenant";
import { getUserPermissionKeys } from "@/lib/permissions";
import { ConflictError, ApiError, NotFoundError } from "@/lib/errors";

async function register(req: NextApiRequest, res: NextApiResponse) {
  const input = registerSchema.parse(req.body);

  // Public route, so there's no tenant yet: resolve it from the school code,
  // then run everything else scoped to that school.
  const school = await basePrisma.school.findUnique({ where: { slug: input.schoolCode } });
  if (!school || school.status !== "ACTIVE") throw new NotFoundError("School");

  // Emails are unique across all schools, so check unscoped.
  const existing = await basePrisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError("An account with this email already exists");

  await runWithTenant(school.id, async () => {
    // STUDENT/TEACHER accounts must link to a profile an admin already
    // created (rollNumber/employeeId are required business fields a generic
    // signup form can't collect), so require the matching key up front.
    let studentToLink: { id: string } | null = null;
    let teacherToLink: { id: string } | null = null;

    if (input.role === "STUDENT") {
      if (!input.rollNumber) throw new ApiError(400, "rollNumber is required to register as a student");
      const student = await prisma.student.findFirst({ where: { rollNumber: input.rollNumber } });
      if (!student) throw new ApiError(404, "No student record found with that roll number");
      if (student.userId) throw new ConflictError("This student already has a login account");
      studentToLink = student;
    }

    if (input.role === "TEACHER") {
      if (!input.employeeId) throw new ApiError(400, "employeeId is required to register as a teacher");
      const teacher = await prisma.teacher.findFirst({ where: { employeeId: input.employeeId } });
      if (!teacher) throw new ApiError(404, "No teacher record found with that employee ID");
      if (teacher.userId) throw new ConflictError("This teacher already has a login account");
      teacherToLink = teacher;
    }

    const role = await prisma.role.findFirst({ where: { key: input.role, isSystem: true } });
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

    issueSession(res, user, role.key);

    const permissions = await getUserPermissionKeys(role.id);
    const { password: _password, ...safeUser } = user;
    void _password;
    res.status(201).json({ ...safeUser, role, permissions: Array.from(permissions) });
  });
}

export default methodRouter({ POST: register });
