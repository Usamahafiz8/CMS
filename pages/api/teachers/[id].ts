import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, getId, withAuth, withPermission } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import { teacherUpdateSchema } from "@/lib/validators";

async function getTeacher(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { classAssignments: { include: { class: true } } },
  });
  if (!teacher) throw new NotFoundError("Teacher");
  res.status(200).json(teacher);
}

async function updateTeacher(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const input = teacherUpdateSchema.parse(req.body);

  const exists = await prisma.teacher.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Teacher");

  const teacher = await prisma.teacher.update({
    where: { id },
    data: {
      ...input,
      phone: input.phone === "" ? null : input.phone,
      email: input.email === "" ? null : input.email,
      qualifications: input.qualifications === "" ? null : input.qualifications,
      address: input.address === "" ? null : input.address,
      profilePic: input.profilePic === "" ? null : input.profilePic,
    },
  });

  res.status(200).json(teacher);
}

async function deleteTeacher(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);

  const exists = await prisma.teacher.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Teacher");

  await prisma.teacher.delete({ where: { id } });
  res.status(200).json({ success: true });
}

export default methodRouter({
  GET: withAuth(getTeacher),
  PUT: withPermission(updateTeacher, "teachers.edit"),
  DELETE: withPermission(deleteTeacher, "teachers.delete"),
});
