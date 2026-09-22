import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/hooks/useAuth";

export interface PermissionCatalogEntry {
  key: string;
  module: string;
  action: string;
  description: string;
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: ["permissions", "catalog"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PermissionCatalogEntry[] }>("/permissions");
      return data.data;
    },
  });
}

// Groups the flat permission catalog by module, e.g. { users: [...], roles: [...] },
// for the grouped checklist UI on the role form.
export function groupPermissionsByModule(
  permissions: PermissionCatalogEntry[],
): Record<string, PermissionCatalogEntry[]> {
  return permissions.reduce<Record<string, PermissionCatalogEntry[]>>((groups, permission) => {
    (groups[permission.module] ??= []).push(permission);
    return groups;
  }, {});
}

// Convenience hook for gating buttons/sections in any component: `can("students.create")`.
export function useCan() {
  const { data: user } = useCurrentUser();
  const permissions = new Set(user?.permissions ?? []);
  return (permission: string | string[]) => {
    const required = Array.isArray(permission) ? permission : [permission];
    return required.some((p) => permissions.has(p));
  };
}
