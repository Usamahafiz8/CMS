import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "node:crypto";
import { basePrisma } from "@/lib/db";
import { methodRouter } from "@/lib/api-handler";
import { schoolSignupSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/password";
import { issueSession } from "@/lib/session";
import { getUserPermissionKeys } from "@/lib/permissions";
import { TRIAL_DAYS } from "@/lib/constants";
import { ApiError, ConflictError } from "@/lib/errors";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "school"
  );
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  while (await basePrisma.school.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${randomBytes(2).toString("hex")}`;
  }
  return slug;
}

// Public "Start free trial" endpoint. Creates a new tenant and makes the
// person signing up its SUPER_ADMIN (school owner: full control, including
// custom roles), then signs them straight in.
async function signup(req: NextApiRequest, res: NextApiResponse) {
  const input = schoolSignupSchema.parse(req.body);

  const existing = await basePrisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError("An account with this email already exists");

  const role = await basePrisma.role.findFirst({ where: { key: "SUPER_ADMIN", isSystem: true } });
  if (!role) throw new ApiError(500, "Role SUPER_ADMIN is not configured");

  const [slug, passwordHash] = await Promise.all([uniqueSlug(input.schoolName), hashPassword(input.password)]);

  const { school, user } = await basePrisma.$transaction(async (tx) => {
    const school = await tx.school.create({
      data: {
        name: input.schoolName,
        slug,
        plan: "TRIAL",
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      },
    });
    const user = await tx.user.create({
      data: {
        schoolId: school.id,
        email: input.email,
        password: passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        roleId: role.id,
        admin: { create: {} },
      },
    });
    return { school, user };
  });

  issueSession(res, user, role.key);

  const permissions = await getUserPermissionKeys(role.id);
  const { password: _password, ...safeUser } = user;
  void _password;
  res.status(201).json({
    ...safeUser,
    role: { id: role.id, key: role.key, name: role.name },
    permissions: Array.from(permissions),
    school,
  });
}

export default methodRouter({ POST: signup });
