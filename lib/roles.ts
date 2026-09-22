// The 5 seeded system roles (see prisma/migrations/20260922140000_add_rbac_roles_permissions).
// Their `key` values are stable and match the app's original Role enum, so
// every existing string comparison against a role key keeps working even
// though roles now live in a table and admins can add custom ones.
export const SYSTEM_ROLE_KEYS = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"] as const;
export type SystemRoleKey = (typeof SYSTEM_ROLE_KEYS)[number];

// Roles that use a dedicated self-service portal rather than the admin
// panel. Any other role (ADMIN, SUPER_ADMIN, or a custom staff role) is
// treated as admin-portal staff.
const PORTAL_ROLE_KEYS = new Set<string>(["TEACHER", "STUDENT", "PARENT"]);

export function isAdminPortalRole(roleKey: string): boolean {
  return !PORTAL_ROLE_KEYS.has(roleKey);
}

// ADMIN and SUPER_ADMIN both get full operational oversight — e.g. they
// bypass the "a teacher may only touch their own classes/students"
// ownership checks. Use this instead of comparing against "ADMIN" alone,
// which would incorrectly exclude Super Admin from everything a plain
// Admin can already do.
export function isFullAccessRole(roleKey: string): boolean {
  return roleKey === "ADMIN" || roleKey === "SUPER_ADMIN";
}

export function homeRouteForRole(roleKey: string): string {
  switch (roleKey) {
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    case "PARENT":
      return "/parent";
    default:
      // ADMIN, SUPER_ADMIN, and any custom (staff) role land in the admin panel.
      return "/admin";
  }
}
