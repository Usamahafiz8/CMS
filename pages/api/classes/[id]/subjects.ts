import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import { assignSubjectSchema } from "@/lib/validators";

function getClassId(req: NextApiRequest): string {
  const { id } = req.query;
  if (typeof id !== "string") throw new NotFoundError("Class");
  return id;
}

async function getClassSubjects(req: NextApiRequest, res: NextApiResponse) {
  const classId = getClassId(req);

  const classExists = await prisma.class.findUnique({ where: { id: classId } });
  if (!classExists) throw new NotFoundError("Class");

  const links = await prisma.classSubject.findMany({
    where: { classId },
    include: { subject: true },
  });

  res.status(200).json({ data: links.map((l) => l.subject) });
}

async function assignSubject(req: NextApiRequest, res: NextApiResponse) {
  const classId = getClassId(req);
  const { subjectId } = assignSubjectSchema.parse(req.body);

  const [classItem, subject] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.subject.findUnique({ where: { id: subjectId } }),
  ]);

  if (!classItem) throw new NotFoundError("Class");
  if (!subject) throw new NotFoundError("Subject");

  const link = await prisma.classSubject.create({
    data: { classId, subjectId },
    include: { subject: true },
  });

  res.status(201).json(link);
}

export default methodRouter({
  GET: withAuth(getClassSubjects),
  POST: withAuth(assignSubject, ["ADMIN"]),
});
