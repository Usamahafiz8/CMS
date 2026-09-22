import type { NextApiRequest, NextApiResponse } from "next";
import { methodRouter } from "@/lib/api-handler";
import { clearAuthCookies } from "@/lib/cookies";

async function logout(req: NextApiRequest, res: NextApiResponse) {
  clearAuthCookies(res);
  res.status(200).json({ success: true });
}

export default methodRouter({ POST: logout });
