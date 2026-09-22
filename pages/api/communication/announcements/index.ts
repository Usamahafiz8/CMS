import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth, withPermission } from "@/lib/api-handler";
import { announcementCreateSchema, paginationSchema } from "@/lib/validators";
import type { Paginated } from "@/lib/types";
import type { TokenPayload } from "@/lib/jwt";

async function getAnnouncements(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const { page, pageSize } = paginationSchema.parse(req.query);

  const [data, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: { OR: [{ targetRole: null }, { targetRole: user.role }] },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.announcement.count({
      where: { OR: [{ targetRole: null }, { targetRole: user.role }] },
    }),
  ]);

  const response: Paginated<(typeof data)[number]> = {
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  };

  res.status(200).json(response);
}

async function createAnnouncement(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const input = announcementCreateSchema.parse(req.body);

  const announcement = await prisma.announcement.create({
    data: { ...input, createdById: user.sub },
    include: { createdBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });

  res.status(201).json(announcement);
}

export default methodRouter({
  GET: withAuth(getAnnouncements),
  POST: withPermission(createAnnouncement, "announcements.manage"),
});
