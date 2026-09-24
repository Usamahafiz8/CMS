import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/generated/prisma/client";

export interface RoleSummary {
  id: string;
  key: string;
  name: string;
}

export type SafeUser = Omit<User, "password" | "roleId"> & {
  role: RoleSummary;
  permissions: string[];
};

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  // ADMIN/SUPER_ADMIN/custom staff roles aren't self-registerable — an
  // existing admin creates those accounts via the user management screen.
  role: "TEACHER" | "STUDENT" | "PARENT";
  rollNumber?: string;
  employeeId?: string;
  // The school's code (its slug), shared by the school admin.
  schoolCode: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<SafeUser>("/auth/me");
      return data;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apiClient.post<SafeUser>("/auth/login", input);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await apiClient.post<SafeUser>("/auth/register", input);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: { currentPassword: string; newPassword: string }) => {
      await apiClient.post("/auth/change-password", input);
    },
  });
}

export interface SchoolSignupInput {
  schoolName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Creates a new school (tenant) on a free trial and signs its owner in.
export function useSchoolSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SchoolSignupInput) => {
      const { data } = await apiClient.post<SafeUser>("/schools/signup", input);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}
