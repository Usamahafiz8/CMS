import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

async function getMyStudentProfile(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const student = await prisma.student.findUnique({
    where: { userId: user.sub },
    include: { classEnrollments: { include: { class: true } } },
  });
  if (!student) throw new NotFoundError("Student profile");
  res.status(200).json(student);
}

export default methodRouter({ GET: withAuth(getMyStudentProfile, ["STUDENT"]) });
