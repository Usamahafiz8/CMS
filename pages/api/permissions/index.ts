import type { NextApiRequest, NextApiResponse } from "next";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { PERMISSION_CATALOG } from "@/lib/permissions";

async function getPermissions(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ data: PERMISSION_CATALOG });
}

export default methodRouter({ GET: withPermission(getPermissions, "permissions.view") });
