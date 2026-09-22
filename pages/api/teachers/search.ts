import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { searchSchema } from "@/lib/validators";

async function searchTeachers(req: NextApiRequest, res: NextApiResponse) {
  const { q } = searchSchema.parse(req.query);

  const teachers = await prisma.teacher.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { employeeId: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  res.status(200).json({ data: teachers });
}

export default methodRouter({ GET: withAuth(searchTeachers) });
