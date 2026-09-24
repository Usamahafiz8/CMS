import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { linkChildSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

async function linkChild(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const { rollNumber } = linkChildSchema.parse(req.body);

  const parent = await prisma.parent.findUnique({ where: { userId: user.sub } });
  if (!parent) throw new NotFoundError("Parent profile");

  const student = await prisma.student.findFirst({ where: { rollNumber } });
  if (!student) throw new NotFoundError("Student with that roll number");

  const updated = await prisma.parent.update({
    where: { id: parent.id },
    data: { children: { connect: { id: student.id } } },
    include: { children: { include: { classEnrollments: { include: { class: true } } } } },
  });

  res.status(200).json(updated);
}

export default methodRouter({ POST: withAuth(linkChild, ["PARENT"]) });
