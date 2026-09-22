import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, getId, withPermission } from "@/lib/api-handler";
import { userUpdateSchema } from "@/lib/validators";
import { requirePermission } from "@/lib/permissions";
import { NotFoundError, ApiError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  profilePic: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, key: true, name: true } },
} as const;

async function getUser(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new NotFoundError("User");
  res.status(200).json(user);
}

async function updateUser(req: NextApiRequest, res: NextApiResponse, currentUser: TokenPayload) {
  const id = getId(req);
  const input = userUpdateSchema.parse(req.body);

  const target = await prisma.user.findUnique({ where: { id }, include: { role: true } });
  if (!target) throw new NotFoundError("User");

  // Changing roleId or status are more sensitive than editing contact
  // details, so they each require their own permission on top of the base
  // users.edit — and neither can be used to escalate or lock out Super
  // Admin accounts.
  if (input.roleId && input.roleId !== target.roleId) {
    await requirePermission(currentUser, "users.assignRole");

    if (target.id === currentUser.sub) {
      throw new ApiError(403, "You cannot change your own role");
    }

    const newRole = await prisma.role.findUnique({ where: { id: input.roleId } });
    if (!newRole) throw new ApiError(400, "Selected role does not exist");

    const touchesSuperAdmin = target.role.key === "SUPER_ADMIN" || newRole.key === "SUPER_ADMIN";
    if (touchesSuperAdmin && currentUser.role !== "SUPER_ADMIN") {
      throw new ApiError(403, "Only a Super Admin can assign or remove the Super Admin role");
    }
  }

  if (input.status && input.status !== target.status) {
    await requirePermission(currentUser, "users.delete");

    if (target.id === currentUser.sub) {
      throw new ApiError(403, "You cannot change your own account status");
    }
    if (target.role.key === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      throw new ApiError(403, "Only a Super Admin can change another Super Admin's status");
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone === "" ? null : input.phone,
      roleId: input.roleId,
      status: input.status,
    },
    select: userSelect,
  });

  res.status(200).json(user);
}

export default methodRouter({
  GET: withPermission(getUser, "users.view"),
  PUT: withPermission(updateUser, "users.edit"),
});
