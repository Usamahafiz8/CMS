import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, getId, withAuth, withPermission } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import { announcementUpdateSchema } from "@/lib/validators";

async function getAnnouncement(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: { createdBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  if (!announcement) throw new NotFoundError("Announcement");
  res.status(200).json(announcement);
}

async function updateAnnouncement(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const input = announcementUpdateSchema.parse(req.body);

  const exists = await prisma.announcement.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Announcement");

  const announcement = await prisma.announcement.update({ where: { id }, data: input });
  res.status(200).json(announcement);
}

async function deleteAnnouncement(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);

  const exists = await prisma.announcement.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Announcement");

  await prisma.announcement.delete({ where: { id } });
  res.status(200).json({ success: true });
}

export default methodRouter({
  GET: withAuth(getAnnouncement),
  PUT: withPermission(updateAnnouncement, "announcements.manage"),
  DELETE: withPermission(deleteAnnouncement, "announcements.manage"),
});
