import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { RoleSummary } from "@/hooks/useAuth";

interface DirectoryUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Backs the messaging recipient picker — any authenticated user can browse
// it. See useAdminUsers for the full, permission-gated account listing.
export function useUsers(role?: string) {
  return useQuery({
    queryKey: ["users", role],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: DirectoryUser[] }>("/users", { params: { role } });
      return data.data;
    },
  });
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  role: RoleSummary;
}

export interface UserCreateInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  rollNumber?: string;
  employeeId?: string;
}

export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

const adminUsersKey = (page: number, pageSize: number) => ["users", "admin", { page, pageSize }] as const;

// The same GET /api/users the directory uses — the backend returns the full
// paginated shape instead of the lightweight directory once the caller
// holds users.view, so this is the "real" admin listing.
export function useAdminUsers(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: adminUsersKey(page, pageSize),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<AdminUser>>("/users", { params: { page, pageSize } });
      return data;
    },
  });
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: ["users", "admin", id],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminUser>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UserCreateInput) => {
      const { data } = await apiClient.post<AdminUser>("/users", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UserUpdateInput) => {
      const { data } = await apiClient.put<AdminUser>(`/users/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Unlike useUpdateUser, this isn't scoped to one id up front — handy for a
// list/table where any row's status can change without a per-row hook.
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UserUpdateInput["status"] }) => {
      const { data } = await apiClient.put<AdminUser>(`/users/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: async (input: { userId: string; newPassword: string }) => {
      await apiClient.post("/auth/reset-password", input);
    },
  });
}
