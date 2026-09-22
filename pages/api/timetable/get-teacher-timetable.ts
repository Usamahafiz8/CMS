import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";

const querySchema = z.object({ teacherId: z.string().trim().min(1, "teacherId is required") });

async function getTeacherTimetable(req: NextApiRequest, res: NextApiResponse) {
  const { teacherId } = querySchema.parse(req.query);

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new NotFoundError("Teacher");

  const slots = await prisma.timetableSlot.findMany({
    where: { teacherId },
    include: { class: true, subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
  });

  res.status(200).json({ data: slots });
}

export default methodRouter({ GET: withAuth(getTeacherTimetable) });
