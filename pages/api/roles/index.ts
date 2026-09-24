import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, basePrisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { roleCreateSchema } from "@/lib/validators";
import { PERMISSION_KEYS } from "@/lib/permissions";
import { ApiError } from "@/lib/errors";
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

function toRoleKey(name: string): string {
  return (
    name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "ROLE"
  );
}

async function uniqueRoleKey(name: string): Promise<string> {
  const base = toRoleKey(name);
  let key = base;
  let suffix = 2;
  // Role keys are globally unique, so check across every school.
  while (await basePrisma.role.findUnique({ where: { key } })) {
    key = `${base}_${suffix}`;
    suffix += 1;
  }
  return key;
}

async function getRoles(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const roles = await prisma.role.findMany({ orderBy: { createdAt: "asc" }, select: roleSelect(user.schoolId) });
  res.status(200).json({
    data: roles.map((r) => ({ ...r, permissionKeys: r.rolePermissions.map((rp) => rp.permission.key) })),
  });
}

async function createRole(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const input = roleCreateSchema.parse(req.body);

  const invalid = input.permissionKeys.filter((k) => !PERMISSION_KEYS.includes(k));
  if (invalid.length > 0) throw new ApiError(400, `Unknown permission key(s): ${invalid.join(", ")}`);

  const key = await uniqueRoleKey(input.name);

  const role = await prisma.role.create({
    data: {
      key,
      name: input.name,
      description: input.description || null,
      isSystem: false,
      rolePermissions: { create: input.permissionKeys.map((permKey) => ({ permission: { connect: { key: permKey } } })) },
    },
    select: roleSelect(user.schoolId),
  });

  res.status(201).json({ ...role, permissionKeys: role.rolePermissions.map((rp) => rp.permission.key) });
}

export default methodRouter({
  GET: withPermission(getRoles, "roles.view"),
  POST: withPermission(createRole, "roles.create"),
});
