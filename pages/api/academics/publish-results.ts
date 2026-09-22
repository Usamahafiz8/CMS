import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { publishResultsSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";

async function publishResults(req: NextApiRequest, res: NextApiResponse) {
  const { examId } = publishResultsSchema.parse(req.body);

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw new NotFoundError("Exam");

  const result = await prisma.mark.updateMany({
    where: { examId },
    data: { isPublished: true },
  });

  res.status(200).json({ success: true, publishedCount: result.count });
}

export default methodRouter({ POST: withPermission(publishResults, "marks.publish") });
