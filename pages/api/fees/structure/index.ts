import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth, withPermission } from "@/lib/api-handler";
import { feeStructureCreateSchema } from "@/lib/validators";

async function getFeeStructures(req: NextApiRequest, res: NextApiResponse) {
  const structures = await prisma.feeStructure.findMany({ orderBy: { createdAt: "desc" } });
  res.status(200).json({ data: structures });
}

async function createFeeStructure(req: NextApiRequest, res: NextApiResponse) {
  const input = feeStructureCreateSchema.parse(req.body);
  const structure = await prisma.feeStructure.create({ data: input });
  res.status(201).json(structure);
}

export default methodRouter({
  GET: withAuth(getFeeStructures),
  POST: withPermission(createFeeStructure, "fees.manage"),
});
