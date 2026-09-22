import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, getId, withAuth } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import { subjectUpdateSchema } from "@/lib/validators";

async function getSubject(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: { classes: { include: { class: true } } },
  });
  if (!subject) throw new NotFoundError("Subject");
  res.status(200).json(subject);
}

async function updateSubject(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const input = subjectUpdateSchema.parse(req.body);

  const exists = await prisma.subject.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Subject");

  const subject = await prisma.subject.update({ where: { id }, data: input });
  res.status(200).json(subject);
}

async function deleteSubject(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);

  const exists = await prisma.subject.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Subject");

  await prisma.subject.delete({ where: { id } });
  res.status(200).json({ success: true });
}

export default methodRouter({
  GET: withAuth(getSubject),
  PUT: withAuth(updateSubject, ["ADMIN"]),
  DELETE: withAuth(deleteSubject, ["ADMIN"]),
});
