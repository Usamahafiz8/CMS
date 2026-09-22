import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface RoleWithPermissions {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { users: number };
  permissionKeys: string[];
}

export interface RoleInput {
  name: string;
  description?: string;
  permissionKeys: string[];
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: RoleWithPermissions[] }>("/roles");
      return data.data;
    },
  });
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: async () => {
      const { data } = await apiClient.get<RoleWithPermissions>(`/roles/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RoleInput) => {
      const { data } = await apiClient.post<RoleWithPermissions>("/roles", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<RoleInput>) => {
      const { data } = await apiClient.put<RoleWithPermissions>(`/roles/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
