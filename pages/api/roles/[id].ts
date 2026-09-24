import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, getId, withPermission } from "@/lib/api-handler";
import { roleUpdateSchema } from "@/lib/validators";
import { PERMISSION_KEYS } from "@/lib/permissions";
import { NotFoundError, ApiError, ConflictError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

// System roles are shared by every school, so the user count must be
// filtered to the caller's school (nested counts aren't tenant-scoped).
function roleSelect(schoolId: string) {
  return {
    id: true,
    key: true,
    name: true,
    description: true,
    isSystem: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { users: { where: { schoolId } } } },
    rolePermissions: { select: { permission: { select: { key: true } } } },
  } as const;
}

async function getRole(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const id = getId(req);
  const role = await prisma.role.findUnique({ where: { id }, select: roleSelect(user.schoolId) });
  if (!role) throw new NotFoundError("Role");
  res.status(200).json({ ...role, permissionKeys: role.rolePermissions.map((rp) => rp.permission.key) });
}

async function updateRole(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const id = getId(req);
  const input = roleUpdateSchema.parse(req.body);

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new NotFoundError("Role");

  // SUPER_ADMIN is permanently protected — it must always hold every
  // permission so there's always at least one role that can administer the
  // system, no matter what other roles get edited or deleted.
  if (role.key === "SUPER_ADMIN") {
    throw new ApiError(403, "The Super Admin role cannot be modified");
  }

  // System roles are shared by every school on the platform — editing one
  // would change it for all tenants. Schools customise via their own roles.
  if (role.isSystem) {
    throw new ApiError(403, "Built-in roles can't be edited. Create a custom role instead.");
  }

  if (input.permissionKeys) {
    const invalid = input.permissionKeys.filter((k) => !PERMISSION_KEYS.includes(k));
    if (invalid.length > 0) throw new ApiError(400, `Unknown permission key(s): ${invalid.join(", ")}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: { id },
      data: { name: input.name, description: input.description === "" ? null : input.description },
    });

    if (input.permissionKeys) {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      if (input.permissionKeys.length > 0) {
        const permissions = await tx.permission.findMany({
          where: { key: { in: input.permissionKeys } },
          select: { id: true },
        });
        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({ roleId: id, permissionId: p.id })),
        });
      }
    }
  });

  const updated = await prisma.role.findUniqueOrThrow({ where: { id }, select: roleSelect(user.schoolId) });
  res.status(200).json({ ...updated, permissionKeys: updated.rolePermissions.map((rp) => rp.permission.key) });
}

async function deleteRole(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);

  const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!role) throw new NotFoundError("Role");

  if (role.isSystem) throw new ApiError(403, "System roles cannot be deleted");
  if (role._count.users > 0) {
    throw new ConflictError("Reassign the users on this role before deleting it");
  }

  await prisma.role.delete({ where: { id } });
  res.status(200).json({ success: true });
}

export default methodRouter({
  GET: withPermission(getRole, "roles.view"),
  PUT: withPermission(updateRole, "roles.edit"),
  DELETE: withPermission(deleteRole, "roles.delete"),
});
