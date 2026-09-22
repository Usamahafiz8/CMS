import { stringifySetCookie } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

export const ACCESS_TOKEN_COOKIE = "sh_access_token";
export const REFRESH_TOKEN_COOKIE = "sh_refresh_token";

const ACCESS_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function baseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export function setAuthCookies(res: NextApiResponse, accessToken: string, refreshToken: string) {
  res.setHeader("Set-Cookie", [
    stringifySetCookie({ name: ACCESS_TOKEN_COOKIE, value: accessToken, ...baseOptions(), maxAge: ACCESS_MAX_AGE }),
    stringifySetCookie({
      name: REFRESH_TOKEN_COOKIE,
      value: refreshToken,
      ...baseOptions(),
      maxAge: REFRESH_MAX_AGE,
    }),
  ]);
}

export function clearAuthCookies(res: NextApiResponse) {
  res.setHeader("Set-Cookie", [
    stringifySetCookie({ name: ACCESS_TOKEN_COOKIE, value: "", ...baseOptions(), maxAge: 0 }),
    stringifySetCookie({ name: REFRESH_TOKEN_COOKIE, value: "", ...baseOptions(), maxAge: 0 }),
  ]);
}

export function getAccessToken(req: NextApiRequest): string | undefined {
  return req.cookies[ACCESS_TOKEN_COOKIE];
}

export function getRefreshToken(req: NextApiRequest): string | undefined {
  return req.cookies[REFRESH_TOKEN_COOKIE];
}
