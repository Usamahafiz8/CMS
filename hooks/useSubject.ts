import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Subject } from "@/generated/prisma/client";

export interface SubjectInput {
  name: string;
  code: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

const subjectsKey = (page: number, pageSize: number) => ["subjects", { page, pageSize }] as const;

export function useSubjects(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: subjectsKey(page, pageSize),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Subject>>("/subjects", {
        params: { page, pageSize },
      });
      return data;
    },
  });
}

export function useSubject(id: string | undefined) {
  return useQuery({
    queryKey: ["subjects", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Subject>(`/subjects/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SubjectInput) => {
      const { data } = await apiClient.post<Subject>("/subjects", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateSubject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<SubjectInput>) => {
      const { data } = await apiClient.put<Subject>(`/subjects/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
