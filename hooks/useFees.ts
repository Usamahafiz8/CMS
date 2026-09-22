import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Fee, FeeStructure, Student } from "@/generated/prisma/client";

type FeeRow = Fee & { student: Student; feeStructure: FeeStructure | null };

export interface FeeStructureInput {
  name: string;
  feeType: string;
  amount: number;
  academicYear: string;
  dueDate: string;
}

export function useFeeStructures() {
  return useQuery({
    queryKey: ["fee-structures"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: FeeStructure[] }>("/fees/structure");
      return data.data;
    },
  });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FeeStructureInput) => {
      const { data } = await apiClient.post<FeeStructure>("/fees/structure", input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fee-structures"] }),
  });
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { feeStructureId: string; studentId?: string; classId?: string }) => {
      const { data } = await apiClient.post<{ data: Fee[]; skipped: number }>(
        "/fees/invoices/generate",
        input,
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useInvoices(params: { studentId?: string; classId?: string; status?: string }) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: FeeRow[] }>("/fees/invoices/get", { params });
      return data.data;
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (feeId: string) => {
      const { data } = await apiClient.post<Fee>("/fees/payments/record", { feeId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["outstanding-fees"] });
    },
  });
}

export function useSendFeeReminder() {
  return useMutation({
    mutationFn: async (feeId: string) => {
      await apiClient.post("/fees/reminders/send", { feeId });
    },
  });
}

export function useOutstandingFees() {
  return useQuery({
    queryKey: ["outstanding-fees"],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: FeeRow[];
        summary: { totalOutstanding: number; count: number; overdueCount: number };
      }>("/fees/reports/outstanding");
      return data;
    },
  });
}
