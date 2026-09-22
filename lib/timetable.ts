import { prisma } from "@/lib/db";

export interface ProposedSlot {
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  room: string;
  teacherId: string;
  subjectId: string;
}

export interface TimetableConflict {
  dayOfWeek: number;
  periodNumber: number;
  teacherId: string;
  conflictingClassId: string;
  conflictingClassName: string;
}

// Checks whether any proposed slot double-books a teacher into a different
// class at the same day/period. Slots for `classId` itself are excluded,
// since those are the ones being replaced by this submission.
export async function findTimetableConflicts(
  classId: string,
  slots: ProposedSlot[],
): Promise<TimetableConflict[]> {
  const teacherIds = [...new Set(slots.map((s) => s.teacherId))];

  const existingSlots = await prisma.timetableSlot.findMany({
    where: {
      teacherId: { in: teacherIds },
      classId: { not: classId },
    },
    include: { class: true },
  });

  const conflicts: TimetableConflict[] = [];
  for (const proposed of slots) {
    const match = existingSlots.find(
      (existing) =>
        existing.teacherId === proposed.teacherId &&
        existing.dayOfWeek === proposed.dayOfWeek &&
        existing.periodNumber === proposed.periodNumber,
    );
    if (match) {
      conflicts.push({
        dayOfWeek: proposed.dayOfWeek,
        periodNumber: proposed.periodNumber,
        teacherId: proposed.teacherId,
        conflictingClassId: match.classId,
        conflictingClassName: `${match.class.name} - ${match.class.section}`,
      });
    }
  }

  return conflicts;
}
