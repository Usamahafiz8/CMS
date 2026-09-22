import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import type { TokenPayload } from "@/lib/jwt";

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;
type AuthHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: TokenPayload,
) => Promise<void> | void;

// Gates a route by role key. Reserved for identity-only checks — "this
// endpoint is only for a user's own STUDENT/TEACHER/PARENT profile" — where
// there's no finer-grained capability to check. Operational, admin-tier
// actions should use `withPermission` instead so custom roles and
// SUPER_ADMIN are handled automatically.
export function withAuth(handler: AuthHandler, allowedRoles?: string[]): Handler {
  return async (req, res) => {
    const user = getCurrentUser(req);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    await handler(req, res, user);
  };
}

// Gates a route by permission key(s) instead of a hardcoded role list. The
// user is authorized if their role holds at least one of the given
// permissions — this is the reusable authorization guard every
// admin-capability route should use.
export function withPermission(handler: AuthHandler, permission: string | string[]): Handler {
  return async (req, res) => {
    const user = getCurrentUser(req);
    await requirePermission(user, permission);
    await handler(req, res, user);
  };
}

export function methodRouter(handlers: Partial<Record<string, Handler>>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const handler = req.method ? handlers[req.method] : undefined;
    if (!handler) {
      res.setHeader("Allow", Object.keys(handlers));
      res.status(405).json({ error: `Method ${req.method} not allowed` });
      return;
    }

    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error);
    }
  };
}

export function sendError(res: NextApiResponse, error: unknown) {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      fieldErrors: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      res.status(409).json({
        error: `A record with this ${target ?? "value"} already exists`,
      });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ error: "Record not found" });
      return;
    }
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}

export function getId(req: NextApiRequest): string {
  const { id } = req.query;
  if (typeof id !== "string") {
    throw new ApiError(400, "Invalid id parameter");
  }
  return id;
}
