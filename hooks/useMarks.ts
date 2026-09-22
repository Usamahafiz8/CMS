import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Exam, Mark, Student, Subject } from "@/generated/prisma/client";

type MarkRow = Mark & { student: Student; subject: Subject; exam: Exam };

export interface MarkEntryInput {
  studentId: string;
  teacherId: string;
  examId: string;
  subjectId: string;
  marks: number;
  totalMarks: number;
  remarks?: string;
}

export function useMarks(params: { examId?: string; classId?: string; studentId?: string; subjectId?: string }) {
  return useQuery({
    queryKey: ["marks", params],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: MarkRow[] }>("/academics/get-marks", { params });
      return data.data;
    },
    enabled: !!(params.examId || params.classId || params.studentId || params.subjectId),
  });
}

export function useEnterMark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MarkEntryInput) => {
      const { data } = await apiClient.post<Mark>("/academics/mark-entry", input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marks"] }),
  });
}

export function useReportCard(studentId: string | undefined, examId: string | undefined) {
  return useQuery({
    queryKey: ["report-card", studentId, examId],
    queryFn: async () => {
      const { data } = await apiClient.get("/academics/get-report-card", { params: { studentId, examId } });
      return data;
    },
    enabled: !!studentId && !!examId,
  });
}

export function usePublishResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (examId: string) => {
      const { data } = await apiClient.post<{ success: boolean; publishedCount: number }>(
        "/academics/publish-results",
        { examId },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["report-card"] });
    },
  });
}
