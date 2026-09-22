import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { createClassTimetableSchema } from "@/lib/validators";
import { findTimetableConflicts } from "@/lib/timetable";
import { NotFoundError, ConflictError } from "@/lib/errors";

async function createClassTimetable(req: NextApiRequest, res: NextApiResponse) {
  const { classId, slots } = createClassTimetableSchema.parse(req.body);

  const classItem = await prisma.class.findUnique({ where: { id: classId } });
  if (!classItem) throw new NotFoundError("Class");

  const conflicts = await findTimetableConflicts(classId, slots);
  if (conflicts.length > 0) {
    throw new ConflictError(
      `Teacher scheduling conflict on day ${conflicts[0].dayOfWeek}, period ${conflicts[0].periodNumber} (already teaching ${conflicts[0].conflictingClassName})`,
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    await tx.timetableSlot.deleteMany({ where: { classId } });
    return Promise.all(
      slots.map((slot) => tx.timetableSlot.create({ data: { classId, ...slot } })),
    );
  });

  res.status(201).json({ data: created });
}

export default methodRouter({ POST: withAuth(createClassTimetable, ["ADMIN"]) });
