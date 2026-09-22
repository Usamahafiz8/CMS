import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { isFullAccessRole } from "@/lib/roles";
import type { TokenPayload } from "@/lib/jwt";
import type { Teacher } from "@/generated/prisma/client";

// ============================================================
// PERMISSION CATALOG
// ============================================================
// The full set of granular capabilities the app enforces, grouped by the
// module they belong to. This is the single source of truth: it's seeded
// into the Permission table by prisma/migrations/20260922140000_add_rbac_roles_permissions
// and prisma/seed.ts, and read back here to check a user's access. Every
// entry corresponds to an actual gated action in the codebase — this list
// intentionally does not include "view" permissions for modules (students,
// teachers, classes, subjects, attendance, marks, exams, timetable,
// communication, fees, reports) whose read endpoints have always been open
// to any authenticated user; only mutating actions that were already
// role-gated (or are newly introduced by user/role management) appear here.
export const PERMISSION_CATALOG: { key: string; module: string; action: string; description: string }[] = [
  { key: "users.view", module: "users", action: "view", description: "View the list and detail of user accounts" },
  { key: "users.create", module: "users", action: "create", description: "Create new user accounts" },
  { key: "users.edit", module: "users", action: "edit", description: "Edit user account details and status" },
  { key: "users.delete", module: "users", action: "delete", description: "Deactivate or suspend user accounts" },
  {
    key: "users.changePassword",
    module: "users",
    action: "changePassword",
    description: "Reset another user's password",
  },
  { key: "users.assignRole", module: "users", action: "assignRole", description: "Change a user's assigned role" },
  { key: "roles.view", module: "roles", action: "view", description: "View roles and their permissions" },
  { key: "roles.create", module: "roles", action: "create", description: "Create custom roles" },
  {
    key: "roles.edit",
    module: "roles",
    action: "edit",
    description: "Edit roles and their permission assignments",
  },
  { key: "roles.delete", module: "roles", action: "delete", description: "Delete non-system roles" },
  {
    key: "permissions.view",
    module: "permissions",
    action: "view",
    description: "View the system permission catalog",
  },
  { key: "students.create", module: "students", action: "create", description: "Add new students" },
  { key: "students.edit", module: "students", action: "edit", description: "Edit student records" },
  { key: "students.delete", module: "students", action: "delete", description: "Delete student records" },
  { key: "teachers.create", module: "teachers", action: "create", description: "Add new teachers" },
  { key: "teachers.edit", module: "teachers", action: "edit", description: "Edit teacher records" },
  { key: "teachers.delete", module: "teachers", action: "delete", description: "Delete teacher records" },
  { key: "classes.create", module: "classes", action: "create", description: "Create classes" },
  {
    key: "classes.edit",
    module: "classes",
    action: "edit",
    description: "Edit classes and manage class rosters",
  },
  { key: "classes.delete", module: "classes", action: "delete", description: "Delete classes" },
  { key: "subjects.create", module: "subjects", action: "create", description: "Create subjects" },
  { key: "subjects.edit", module: "subjects", action: "edit", description: "Edit subjects" },
  { key: "subjects.delete", module: "subjects", action: "delete", description: "Delete subjects" },
  { key: "attendance.mark", module: "attendance", action: "mark", description: "Mark student attendance" },
  { key: "attendance.manage", module: "attendance", action: "manage", description: "Mark teacher attendance" },
  { key: "marks.enter", module: "marks", action: "enter", description: "Enter student marks" },
  { key: "marks.publish", module: "marks", action: "publish", description: "Publish exam results" },
  { key: "exams.create", module: "exams", action: "create", description: "Create exams" },
  {
    key: "exams.edit",
    module: "exams",
    action: "edit",
    description: "Edit exams, timetables and invigilators",
  },
  { key: "exams.delete", module: "exams", action: "delete", description: "Delete exams" },
  {
    key: "timetable.manage",
    module: "timetable",
    action: "manage",
    description: "Create and manage class timetables",
  },
  {
    key: "announcements.manage",
    module: "announcements",
    action: "manage",
    description: "Create, edit and delete announcements",
  },
  {
    key: "notifications.send",
    module: "notifications",
    action: "send",
    description: "Send notifications to users",
  },
  {
    key: "fees.manage",
    module: "fees",
    action: "manage",
    description: "Manage fee structures, invoices, payments and reminders",
  },
  { key: "fees.viewReports", module: "fees", action: "viewReports", description: "View outstanding fees reports" },
  { key: "reports.view", module: "reports", action: "view", description: "View attendance and academic reports" },
  { key: "reports.export", module: "reports", action: "export", description: "Export reports" },
  {
    key: "reports.viewFinancial",
    module: "reports",
    action: "viewFinancial",
    description: "View financial reports",
  },
];

export const PERMISSION_KEYS = PERMISSION_CATALOG.map((p) => p.key);

// ============================================================
// PERMISSION ENGINE
// ============================================================
export async function getUserPermissionKeys(roleId: string): Promise<Set<string>> {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    select: { permission: { select: { key: true } } },
  });
  return new Set(rolePermissions.map((rp) => rp.permission.key));
}

export async function hasPermission(user: TokenPayload, permission: string | string[]): Promise<boolean> {
  const required = Array.isArray(permission) ? permission : [permission];
  const count = await prisma.rolePermission.count({
    where: { roleId: user.roleId, permission: { key: { in: required } } },
  });
  return count > 0;
}

// Throws 403 unless the user's role has at least one of the given permissions.
export async function requirePermission(user: TokenPayload, permission: string | string[]): Promise<void> {
  if (!(await hasPermission(user, permission))) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
}

// Resolves the Teacher record for the current user and confirms they're
// assigned to `classId`. Admins bypass the check entirely. Returns the
// Teacher record so callers can use its id instead of trusting a
// client-supplied teacherId.
export async function assertTeacherOwnsClass(user: TokenPayload, classId: string): Promise<Teacher | null> {
  if (isFullAccessRole(user.role)) return null;
  if (user.role !== "TEACHER") {
    throw new ApiError(403, "Only teachers or admins may perform this action");
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.sub } });
  if (!teacher) throw new ApiError(403, "No teacher profile is linked to this account");

  const assignment = await prisma.classAssignment.findUnique({
    where: { teacherId_classId: { teacherId: teacher.id, classId } },
  });
  if (!assignment) throw new ApiError(403, "You are not assigned to this class");

  return teacher;
}

// Same idea, but for actions scoped to a single student rather than a
// whole class — confirms the teacher is assigned to at least one class
// the student is enrolled in.
export async function assertTeacherOwnsStudent(user: TokenPayload, studentId: string): Promise<Teacher | null> {
  if (isFullAccessRole(user.role)) return null;
  if (user.role !== "TEACHER") {
    throw new ApiError(403, "Only teachers or admins may perform this action");
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.sub } });
  if (!teacher) throw new ApiError(403, "No teacher profile is linked to this account");

  const shared = await prisma.classEnrollment.findFirst({
    where: {
      studentId,
      class: { assignments: { some: { teacherId: teacher.id } } },
    },
  });
  if (!shared) throw new ApiError(403, "This student is not in one of your classes");

  return teacher;
}

// Confirms the current user is allowed to view `studentId`'s records.
// Admins and teachers may view any student; a student may only view their
// own; a parent may only view their linked children.
export async function assertCanViewStudent(user: TokenPayload, studentId: string): Promise<void> {
  if (isFullAccessRole(user.role) || user.role === "TEACHER") return;

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.sub } });
    if (!student || student.id !== studentId) {
      throw new ApiError(403, "You may only view your own records");
    }
    return;
  }

  if (user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: user.sub },
      include: { children: true },
    });
    if (!parent || !parent.children.some((c) => c.id === studentId)) {
      throw new ApiError(403, "You may only view your own children's records");
    }
    return;
  }

  throw new ApiError(403, "You do not have permission to view this student's records");
}
