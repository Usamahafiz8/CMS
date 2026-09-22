// Idempotent seed for the RBAC system roles + permission catalog. Existing
// databases already have this data from migration
// 20260922140000_add_rbac_roles_permissions — this script exists so a fresh
// environment (or a database restored without that migration's data) ends
// up in the same state. Safe to re-run: every write is an upsert.
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PERMISSION_CATALOG } from "../lib/permissions";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SYSTEM_ROLES: { key: string; name: string; description: string }[] = [
  {
    key: "SUPER_ADMIN",
    name: "Super Admin",
    description: "Full administrative control over the entire system, including roles and permissions.",
  },
  {
    key: "ADMIN",
    name: "Admin",
    description:
      "Manages day-to-day school operations: users, students, teachers, classes, academics, fees, communication and reports.",
  },
  {
    key: "TEACHER",
    name: "Teacher",
    description: "Manages attendance, marks, timetable and communication for their own classes.",
  },
  { key: "STUDENT", name: "Student", description: "Views their own attendance, marks, timetable, fees and messages." },
  {
    key: "PARENT",
    name: "Parent",
    description: "Views their linked children's attendance, marks, timetable and fees.",
  },
];

// Same defaults encoded in the migration: TEACHER keeps exactly the
// capabilities that were already allowed alongside ADMIN in the old
// hardcoded role checks; STUDENT/PARENT have none (self-service only).
const TEACHER_PERMISSIONS = ["attendance.mark", "marks.enter", "announcements.manage", "reports.view", "reports.export"];
const ADMIN_EXCLUDED_PERMISSIONS = new Set(["roles.create", "roles.edit", "roles.delete"]);

async function main() {
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, description: role.description },
      create: { key: role.key, name: role.name, description: role.description, isSystem: true },
    });
  }

  for (const permission of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { module: permission.module, action: permission.action, description: permission.description },
      create: permission,
    });
  }

  const roles = await prisma.role.findMany({ where: { key: { in: SYSTEM_ROLES.map((r) => r.key) } } });
  const permissions = await prisma.permission.findMany();
  const roleByKey = new Map(roles.map((r) => [r.key, r]));
  const permByKey = new Map(permissions.map((p) => [p.key, p]));

  async function grant(roleKey: string, permissionKeys: string[]) {
    const role = roleByKey.get(roleKey);
    if (!role) return;
    for (const permKey of permissionKeys) {
      const permission = permByKey.get(permKey);
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  await grant("SUPER_ADMIN", PERMISSION_CATALOG.map((p) => p.key));
  await grant(
    "ADMIN",
    PERMISSION_CATALOG.map((p) => p.key).filter((k) => !ADMIN_EXCLUDED_PERMISSIONS.has(k)),
  );
  await grant("TEACHER", TEACHER_PERMISSIONS);

  console.log("RBAC roles and permissions seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
