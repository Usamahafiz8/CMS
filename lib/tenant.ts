import { AsyncLocalStorage } from "node:async_hooks";

// ============================================================
// TENANT CONTEXT
// ============================================================
// Chalkora is multi-tenant: every school is a tenant, and tenant-owned rows
// carry a `schoolId`. The current request's school is held here for the
// lifetime of the request (set by withAuth/withPermission in
// lib/api-handler.ts), and the Prisma extension in lib/db.ts reads it to scope
// every query. Code outside a tenant context (login, public registration,
// school signup, seed scripts) runs unscoped and must filter explicitly.

const storage = new AsyncLocalStorage<{ schoolId: string }>();

export function runWithTenant<T>(schoolId: string, fn: () => T): T {
  return storage.run({ schoolId }, fn);
}

export function getTenantId(): string | undefined {
  return storage.getStore()?.schoolId;
}

// Models whose rows belong to exactly one school. Parent/Admin are scoped
// through their 1:1 User; Permission/RolePermission are global; Role is
// handled separately because system roles (schoolId = null) are shared.
export const TENANT_MODELS = new Set<string>([
  "User",
  "Student",
  "Teacher",
  "Class",
  "Subject",
  "AttendanceRecord",
  "Mark",
  "Exam",
  "ExamTimetable",
  "TimetableSlot",
  "Fee",
  "FeeStructure",
  "Message",
  "Announcement",
  "Notification",
  "ClassEnrollment",
  "ClassAssignment",
  "ClassSubject",
  "SubjectTeaching",
  "ExamInvigilator",
]);
