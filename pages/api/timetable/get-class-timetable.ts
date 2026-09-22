import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";

const querySchema = z.object({ classId: z.string().trim().min(1, "classId is required") });

async function getClassTimetable(req: NextApiRequest, res: NextApiResponse) {
  const { classId } = querySchema.parse(req.query);

  const classItem = await prisma.class.findUnique({ where: { id: classId } });
  if (!classItem) throw new NotFoundError("Class");

  const slots = await prisma.timetableSlot.findMany({
    where: { classId },
    include: { teacher: true, subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
  });

  res.status(200).json({ data: slots });
}

export default methodRouter({ GET: withAuth(getClassTimetable) });
