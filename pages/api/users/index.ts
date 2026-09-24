import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma, basePrisma } from "@/lib/db";
import { methodRouter, withAuth, withPermission } from "@/lib/api-handler";
import { userCreateSchema, paginationSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/password";
import { hasPermission } from "@/lib/permissions";
import { ApiError, ConflictError, NotFoundError } from "@/lib/errors";
import type { Paginated } from "@/lib/types";
import type { TokenPayload } from "@/lib/jwt";

const querySchema = z.object({
  role: z.string().trim().optional(),
});

// Any authenticated user may browse this endpoint — it backs the messaging
// recipient picker (MessagingPanel) for every portal, so it stays open with
// a small, non-sensitive field set (role as a plain string). The admin User
// Management screen (useAdminUsers) hits the same URL but explicitly asks
// for the paginated shape by sending `page`; that combined with holding
// `users.view` is what switches the response — permission alone isn't
// enough to switch shapes, since every Admin/Super Admin also uses the
// messaging picker and would otherwise get the wrong (object-shaped `role`)
// response there too.
async function listUsers(req: NextApiRequest, res: NextApiResponse, currentUser: TokenPayload) {
  const wantsAdminListing = req.query.page !== undefined;

  if (wantsAdminListing && (await hasPermission(currentUser, "users.view"))) {
    const { page, pageSize } = paginationSchema.parse(req.query);

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          createdAt: true,
          role: { select: { id: true, key: true, name: true } },
        },
      }),
      prisma.user.count(),
    ]);

    const response: Paginated<(typeof data)[number]> = {
      data,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
    };
    res.status(200).json(response);
    return;
  }

  const { role } = querySchema.parse(req.query);

  const users = await prisma.user.findMany({
    where: { ...(role ? { role: { key: role } } : {}), id: { not: currentUser.sub } },
    select: { id: true, firstName: true, lastName: true, email: true, role: { select: { key: true } } },
    orderBy: { firstName: "asc" },
    take: 100,
  });

  res.status(200).json({ data: users.map((u) => ({ ...u, role: u.role.key })) });
}

// Mirrors the linking logic in /api/auth/register.ts: a STUDENT/TEACHER
// account must link to a profile record that already exists (rollNumber/
// employeeId), so an admin creating a login for them supplies the same key.
async function createUser(req: NextApiRequest, res: NextApiResponse) {
  const input = userCreateSchema.parse(req.body);

  const [existing, role] = await Promise.all([
    // Emails are unique across all schools, so check unscoped.
    basePrisma.user.findUnique({ where: { email: input.email } }),
    prisma.role.findUnique({ where: { id: input.roleId } }),
  ]);
  if (existing) throw new ConflictError("An account with this email already exists");
  if (!role) throw new ApiError(400, "Selected role does not exist");

  let studentToLink: { id: string } | null = null;
  let teacherToLink: { id: string } | null = null;

  if (role.key === "STUDENT" && input.rollNumber) {
    const student = await prisma.student.findFirst({ where: { rollNumber: input.rollNumber } });
    if (!student) throw new NotFoundError("Student");
    if (student.userId) throw new ConflictError("This student already has a login account");
    studentToLink = student;
  }

  if (role.key === "TEACHER" && input.employeeId) {
    const teacher = await prisma.teacher.findFirst({ where: { employeeId: input.employeeId } });
    if (!teacher) throw new NotFoundError("Teacher");
    if (teacher.userId) throw new ConflictError("This teacher already has a login account");
    teacherToLink = teacher;
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
      roleId: role.id,
      status: input.status ?? "ACTIVE",
      ...(role.key === "PARENT" ? { parent: { create: {} } } : {}),
      ...(role.key === "ADMIN" || role.key === "SUPER_ADMIN" ? { admin: { create: {} } } : {}),
      ...(studentToLink ? { student: { connect: { id: studentToLink.id } } } : {}),
      ...(teacherToLink ? { teacher: { connect: { id: teacherToLink.id } } } : {}),
    },
    include: { role: { select: { id: true, key: true, name: true } } },
  });

  const { password: _password, ...safeUser } = user;
  void _password;
  res.status(201).json(safeUser);
}

export default methodRouter({
  GET: withAuth(listUsers),
  POST: withPermission(createUser, "users.create"),
});
