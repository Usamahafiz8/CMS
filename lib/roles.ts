import type { Role } from "@/generated/prisma/client";

export function homeRouteForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    case "PARENT":
      return "/parent";
    default:
      return "/";
  }
}
