import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Class, Exam, ExamInvigilator, ExamTimetable, Subject, Teacher } from "@/generated/prisma/client";

export interface ExamInput {
  name: string;
  classId: string;
  type: "MIDTERM" | "FINAL" | "QUARTERLY" | "UNIT_TEST" | "MOCK";
  startDate: string;
  endDate: string;
  subjectIds: string[];
}

type ExamRow = Exam & { class: Class; subjects: Subject[] };

export function useExams(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["exams", { page, pageSize }],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<ExamRow>>("/exams", { params: { page, pageSize } });
      return data;
    },
  });
}

export function useExam(id: string | undefined) {
  return useQuery({
    queryKey: ["exams", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/exams/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ExamInput) => {
      const { data } = await apiClient.post<Exam>("/exams", input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/exams/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useCreateExamTimetable(examId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      entries: { subjectId: string; date: string; startTime: string; endTime: string; room: string }[],
    ) => {
      const { data } = await apiClient.post<{ data: ExamTimetable[] }>("/exams/create-timetable", {
        examId,
        entries,
      });
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams", examId] }),
  });
}

export function useAssignInvigilator(examId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teacherId: string) => {
      const { data } = await apiClient.post<ExamInvigilator & { teacher: Teacher }>(
        "/exams/assign-invigilator",
        { examId, teacherId },
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams", examId] }),
  });
}
