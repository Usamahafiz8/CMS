import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { assignSubstituteSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";

// Simplified substitution: reassigns the teacher on this recurring slot.
// A per-date substitution log (rather than mutating the template) would be
// needed for "sub for just one day" — out of scope for now.
async function assignSubstitute(req: NextApiRequest, res: NextApiResponse) {
  const { slotId, teacherId } = assignSubstituteSchema.parse(req.body);

  const [slot, teacher] = await Promise.all([
    prisma.timetableSlot.findUnique({ where: { id: slotId } }),
    prisma.teacher.findUnique({ where: { id: teacherId } }),
  ]);
  if (!slot) throw new NotFoundError("Timetable slot");
  if (!teacher) throw new NotFoundError("Teacher");

  const updated = await prisma.timetableSlot.update({
    where: { id: slotId },
    data: { teacherId },
    include: { teacher: true, subject: true, class: true },
  });

  res.status(200).json(updated);
}

export default methodRouter({ POST: withPermission(assignSubstitute, "timetable.manage") });
