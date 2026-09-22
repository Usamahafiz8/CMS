import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Student } from "@/generated/prisma/client";

export interface StudentInput {
  firstName: string;
  lastName: string;
  rollNumber: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  guardianName: string;
  guardianPhone: string;
  address?: string;
  profilePic?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

const studentsKey = (page: number, pageSize: number) => ["students", { page, pageSize }] as const;

export function useStudents(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: studentsKey(page, pageSize),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Student>>("/students", {
        params: { page, pageSize },
      });
      return data;
    },
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Student>(`/students/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useStudentSearch(q: string) {
  return useQuery({
    queryKey: ["students", "search", q],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Student[] }>("/students/search", {
        params: { q },
      });
      return data.data;
    },
    enabled: q.trim().length > 0,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: StudentInput) => {
      const { data } = await apiClient.post<Student>("/students", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<StudentInput>) => {
      const { data } = await apiClient.put<Student>(`/students/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
