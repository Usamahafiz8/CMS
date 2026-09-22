import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Class, Student, Subject, Teacher } from "@/generated/prisma/client";

export interface ClassInput {
  name: string;
  section: string;
  capacity: number;
  academicYear: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

type ClassWithCount = Class & { _count: { enrollments: number } };

const classesKey = (page: number, pageSize: number) => ["classes", { page, pageSize }] as const;

export function useClasses(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: classesKey(page, pageSize),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<ClassWithCount>>("/classes", {
        params: { page, pageSize },
      });
      return data;
    },
  });
}

export function useClass(id: string | undefined) {
  return useQuery({
    queryKey: ["classes", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClassInput) => {
      const { data } = await apiClient.post<Class>("/classes", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useUpdateClass(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ClassInput>) => {
      const { data } = await apiClient.put<Class>(`/classes/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useClassStudents(classId: string | undefined) {
  return useQuery({
    queryKey: ["classes", classId, "students"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Student[] }>(`/classes/${classId}/students`);
      return data.data;
    },
    enabled: !!classId,
  });
}

export function useEnrollStudent(classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      const { data } = await apiClient.post(`/classes/${classId}/students`, { studentId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes", classId] });
    },
  });
}

export function useClassSubjects(classId: string | undefined) {
  return useQuery({
    queryKey: ["classes", classId, "subjects"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Subject[] }>(`/classes/${classId}/subjects`);
      return data.data;
    },
    enabled: !!classId,
  });
}

export function useAssignSubjectToClass(classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subjectId: string) => {
      const { data } = await apiClient.post(`/classes/${classId}/subjects`, { subjectId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes", classId] });
    },
  });
}

export function useClassTeachers(classId: string | undefined) {
  return useQuery({
    queryKey: ["classes", classId, "teachers"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Teacher[] }>(`/classes/${classId}/teachers`);
      return data.data;
    },
    enabled: !!classId,
  });
}

export function useAssignTeacherToClass(classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teacherId: string) => {
      const { data } = await apiClient.post(`/classes/${classId}/teachers`, { teacherId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes", classId] });
    },
  });
}
