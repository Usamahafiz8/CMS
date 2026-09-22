import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter } from "@/lib/api-handler";
import { loginSchema } from "@/lib/validators";
import { comparePassword } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { setAuthCookies } from "@/lib/cookies";
import { getUserPermissionKeys } from "@/lib/permissions";
import { ApiError } from "@/lib/errors";

async function login(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new ApiError(401, "Invalid email or password");

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "This account is not active. Contact an administrator.");
  }

  const payload = { sub: user.id, email: user.email, role: user.role.key, roleId: user.roleId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  setAuthCookies(res, accessToken, refreshToken);

  const permissions = await getUserPermissionKeys(user.roleId);
  const { password: _password, ...safeUser } = user;
  void _password;
  res.status(200).json({ ...safeUser, permissions: Array.from(permissions) });
}

export default methodRouter({ POST: login });
