import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, getId, withAuth, withPermission } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import { classUpdateSchema } from "@/lib/validators";

async function getClass(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const classItem = await prisma.class.findUnique({
    where: { id },
    include: {
      subjects: { include: { subject: true } },
      assignments: { include: { teacher: true } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!classItem) throw new NotFoundError("Class");
  res.status(200).json(classItem);
}

async function updateClass(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const input = classUpdateSchema.parse(req.body);

  const exists = await prisma.class.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Class");

  const classItem = await prisma.class.update({ where: { id }, data: input });
  res.status(200).json(classItem);
}

async function deleteClass(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);

  const exists = await prisma.class.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Class");

  await prisma.class.delete({ where: { id } });
  res.status(200).json({ success: true });
}

export default methodRouter({
  GET: withAuth(getClass),
  PUT: withPermission(updateClass, "classes.edit"),
  DELETE: withPermission(deleteClass, "classes.delete"),
});
