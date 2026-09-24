import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getTenantId, TENANT_MODELS } from "@/lib/tenant";

declare global {
  var prismaClient: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Unscoped client. Only for code that deliberately works across tenants
// (school signup, login by email, seed scripts) — everything else should use
// the tenant-scoped `prisma` export below.
export const basePrisma = globalThis.prismaClient ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = basePrisma;
}

type Args = Record<string, unknown> & { where?: object; data?: unknown; create?: object };

const WRITE_WITH_WHERE = new Set(["update", "updateMany", "updateManyAndReturn", "delete", "deleteMany"]);

// Adds the current school to a query's filter / create data. Nested
// relation reads (include/select) aren't rewritten, but they only ever
// traverse from a root row that was already scoped here.
function scopeTenantArgs(operation: string, args: Args, schoolId: string): Args {
  switch (operation) {
    case "create":
      return { ...args, data: { ...(args.data as object), schoolId } };
    case "createMany":
    case "createManyAndReturn":
      return {
        ...args,
        data: Array.isArray(args.data)
          ? args.data.map((d: object) => ({ ...d, schoolId }))
          : { ...(args.data as object), schoolId },
      };
    case "upsert":
      return { ...args, where: { ...args.where, schoolId }, create: { ...args.create, schoolId } };
    default:
      return { ...args, where: { ...args.where, schoolId } };
  }
}

// Roles: system roles (schoolId = null) are visible to every school but can
// only be modified outside a tenant context; custom roles belong to one school.
function scopeRoleArgs(operation: string, args: Args, schoolId: string): Args {
  if (operation === "create") return { ...args, data: { ...(args.data as object), schoolId } };
  if (operation === "upsert" || WRITE_WITH_WHERE.has(operation)) {
    return { ...args, where: { ...args.where, schoolId } };
  }
  if (operation.startsWith("create")) return args;
  // Merge rather than wrap: findUnique needs its unique field at the top level.
  const where = (args.where ?? {}) as { AND?: object | object[] };
  const existingAnd = where.AND === undefined ? [] : Array.isArray(where.AND) ? where.AND : [where.AND];
  return { ...args, where: { ...where, AND: [...existingAnd, { OR: [{ schoolId: null }, { schoolId }] }] } };
}

export const prisma = basePrisma.$extends({
  name: "tenant-scope",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const schoolId = getTenantId();
        if (!schoolId) return query(args);
        if (TENANT_MODELS.has(model)) return query(scopeTenantArgs(operation, args as Args, schoolId) as typeof args);
        if (model === "Role") return query(scopeRoleArgs(operation, args as Args, schoolId) as typeof args);
        return query(args);
      },
    },
  },
});
