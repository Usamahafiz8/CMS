import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import type { TokenPayload } from "@/lib/jwt";

const querySchema = z.object({
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]).optional(),
});

// Lightweight directory used to pick a message recipient. Any authenticated
// user may browse it; only non-sensitive fields are returned.
async function listUsers(req: NextApiRequest, res: NextApiResponse, currentUser: TokenPayload) {
  const { role } = querySchema.parse(req.query);

  const users = await prisma.user.findMany({
    where: { ...(role ? { role } : {}), id: { not: currentUser.sub } },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
    orderBy: { firstName: "asc" },
    take: 100,
  });

  res.status(200).json({ data: users });
}

export default methodRouter({ GET: withAuth(listUsers) });
