import type { NextApiRequest, NextApiResponse } from "next";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { detectConflictsSchema } from "@/lib/validators";
import { findTimetableConflicts } from "@/lib/timetable";

async function detectConflicts(req: NextApiRequest, res: NextApiResponse) {
  const { classId, slots } = detectConflictsSchema.parse(req.body);
  const conflicts = await findTimetableConflicts(classId, slots);
  res.status(200).json({ hasConflicts: conflicts.length > 0, conflicts });
}

export default methodRouter({ POST: withPermission(detectConflicts, "timetable.manage") });
