import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

async function getMyTeacherProfile(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.sub },
    include: { classAssignments: { include: { class: true } } },
  });
  if (!teacher) throw new NotFoundError("Teacher profile");
  res.status(200).json(teacher);
}

export default methodRouter({ GET: withAuth(getMyTeacherProfile, ["TEACHER"]) });
