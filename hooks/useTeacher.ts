import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Teacher } from "@/generated/prisma/client";

export interface TeacherInput {
  firstName: string;
  lastName: string;
  employeeId: string;
  phone?: string;
  email?: string;
  qualifications?: string;
  experience?: number;
  address?: string;
  profilePic?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

const teachersKey = (page: number, pageSize: number) => ["teachers", { page, pageSize }] as const;

export function useTeachers(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: teachersKey(page, pageSize),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Teacher>>("/teachers", {
        params: { page, pageSize },
      });
      return data;
    },
  });
}

export function useTeacher(id: string | undefined) {
  return useQuery({
    queryKey: ["teachers", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Teacher>(`/teachers/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useTeacherSearch(q: string) {
  return useQuery({
    queryKey: ["teachers", "search", q],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Teacher[] }>("/teachers/search", {
        params: { q },
      });
      return data.data;
    },
    enabled: q.trim().length > 0,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TeacherInput) => {
      const { data } = await apiClient.post<Teacher>("/teachers", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useUpdateTeacher(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<TeacherInput>) => {
      const { data } = await apiClient.put<Teacher>(`/teachers/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}
