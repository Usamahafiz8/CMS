import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { searchSchema } from "@/lib/validators";

async function searchStudents(req: NextApiRequest, res: NextApiResponse) {
  const { q } = searchSchema.parse(req.query);

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { rollNumber: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  res.status(200).json({ data: students });
}

export default methodRouter({ GET: withAuth(searchStudents) });
