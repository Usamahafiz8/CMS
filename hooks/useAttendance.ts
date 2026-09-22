import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AttendanceRecord, Student } from "@/generated/prisma/client";

export type AttendanceStatusValue = "PRESENT" | "ABSENT" | "LEAVE";

interface AttendanceSummary {
  present: number;
  absent: number;
  leave: number;
  total: number;
  percentage: number;
}

interface ClassAttendanceReport {
  records: AttendanceRecord[];
  byStudent: { student: Student; summary: AttendanceSummary }[];
  summary: AttendanceSummary;
}

export function useMarkStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      studentId: string;
      date: string;
      status: AttendanceStatusValue;
      remarks?: string;
    }) => {
      const { data } = await apiClient.post<AttendanceRecord>("/attendance/mark-student", input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      classId: string;
      date: string;
      records: { studentId: string; status: AttendanceStatusValue; remarks?: string }[];
    }) => {
      const { data } = await apiClient.post<{ data: AttendanceRecord[] }>(
        "/attendance/bulk-mark",
        input,
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useClassAttendanceReport(classId: string | undefined, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["attendance", "class", classId, startDate, endDate],
    queryFn: async () => {
      const { data } = await apiClient.get<ClassAttendanceReport>("/attendance/get-report", {
        params: { classId, startDate, endDate },
      });
      return data;
    },
    enabled: !!classId,
  });
}

export function useStudentAttendanceReport(studentId: string | undefined) {
  return useQuery({
    queryKey: ["attendance", "student", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ records: AttendanceRecord[]; summary: AttendanceSummary }>(
        "/attendance/get-report",
        { params: { studentId } },
      );
      return data;
    },
    enabled: !!studentId,
  });
}
