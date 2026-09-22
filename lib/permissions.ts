import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";
import type { Teacher } from "@/generated/prisma/client";

// Resolves the Teacher record for the current user and confirms they're
// assigned to `classId`. Admins bypass the check entirely. Returns the
// Teacher record so callers can use its id instead of trusting a
// client-supplied teacherId.
export async function assertTeacherOwnsClass(user: TokenPayload, classId: string): Promise<Teacher | null> {
  if (user.role === "ADMIN") return null;
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
  if (user.role === "ADMIN") return null;
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
  if (user.role === "ADMIN" || user.role === "TEACHER") return;

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
