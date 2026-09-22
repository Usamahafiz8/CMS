import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

async function getMyParentProfile(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const parent = await prisma.parent.findUnique({
    where: { userId: user.sub },
    include: { children: { include: { classEnrollments: { include: { class: true } } } } },
  });
  if (!parent) throw new NotFoundError("Parent profile");
  res.status(200).json(parent);
}

export default methodRouter({ GET: withAuth(getMyParentProfile, ["PARENT"]) });
