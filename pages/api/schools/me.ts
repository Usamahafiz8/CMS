import type { NextApiRequest, NextApiResponse } from "next";
import { basePrisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

// The signed-in user's school: name, plan/trial status, and the slug that
// students/teachers/parents enter as the "school code" to self-register.
async function getMySchool(_req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const school = await basePrisma.school.findUnique({ where: { id: user.schoolId } });
  if (!school) throw new NotFoundError("School");
  res.status(200).json(school);
}

export default methodRouter({ GET: withAuth(getMySchool) });
