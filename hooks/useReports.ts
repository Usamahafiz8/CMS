import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface ClassAttendanceReportRow {
  classId: string;
  className: string;
  studentCount: number;
  present: number;
  absent: number;
  leave: number;
  attendancePercentage: number;
}

interface AcademicReportSubjectRow {
  subjectId: string;
  subjectName: string;
  avgPercentage: number;
  gradeDistribution: { grade: string; count: number }[];
  entryCount: number;
}

interface FinancialReport {
  totalRevenue: number;
  totalOutstanding: number;
  totalInvoiced: number;
  byFeeType: { feeType: string; collected: number; outstanding: number }[];
}

export function useAttendanceReport(classId?: string) {
  return useQuery({
    queryKey: ["reports", "attendance", classId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ClassAttendanceReportRow[] }>("/reports/attendance", {
        params: { classId },
      });
      return data.data;
    },
  });
}

export function useAcademicReport(examId: string | undefined) {
  return useQuery({
    queryKey: ["reports", "academic", examId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ bySubject: AcademicReportSubjectRow[] }>("/reports/academic", {
        params: { examId },
      });
      return data.bySubject;
    },
    enabled: !!examId,
  });
}

export function useFinancialReport() {
  return useQuery({
    queryKey: ["reports", "financial"],
    queryFn: async () => {
      const { data } = await apiClient.get<FinancialReport>("/reports/financial");
      return data;
    },
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: async (input: { type: "attendance" | "academic" | "financial"; examId?: string; classId?: string }) => {
      const response = await apiClient.post<string>("/reports/export", input, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${input.type}-report.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
}
