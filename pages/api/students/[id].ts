import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, getId, withAuth, withPermission } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import { studentUpdateSchema } from "@/lib/validators";

async function getStudent(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const student = await prisma.student.findUnique({
    where: { id },
    include: { classEnrollments: { include: { class: true } } },
  });
  if (!student) throw new NotFoundError("Student");
  res.status(200).json(student);
}

async function updateStudent(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const input = studentUpdateSchema.parse(req.body);

  const exists = await prisma.student.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Student");

  const student = await prisma.student.update({
    where: { id },
    data: {
      ...input,
      phone: input.phone === "" ? null : input.phone,
      email: input.email === "" ? null : input.email,
      address: input.address === "" ? null : input.address,
      profilePic: input.profilePic === "" ? null : input.profilePic,
    },
  });

  res.status(200).json(student);
}

async function deleteStudent(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);

  const exists = await prisma.student.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Student");

  await prisma.student.delete({ where: { id } });
  res.status(200).json({ success: true });
}

export default methodRouter({
  GET: withAuth(getStudent),
  PUT: withPermission(updateStudent, "students.edit"),
  DELETE: withPermission(deleteStudent, "students.delete"),
});
