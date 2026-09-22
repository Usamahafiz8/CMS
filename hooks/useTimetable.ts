import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Class, Subject, Teacher, TimetableSlot } from "@/generated/prisma/client";

export interface SlotInput {
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  room: string;
  teacherId: string;
  subjectId: string;
}

type ClassSlotRow = TimetableSlot & { teacher: Teacher; subject: Subject };
type TeacherSlotRow = TimetableSlot & { class: Class; subject: Subject };

export function useClassTimetable(classId: string | undefined) {
  return useQuery({
    queryKey: ["timetable", "class", classId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ClassSlotRow[] }>("/timetable/get-class-timetable", {
        params: { classId },
      });
      return data.data;
    },
    enabled: !!classId,
  });
}

export function useTeacherTimetable(teacherId: string | undefined) {
  return useQuery({
    queryKey: ["timetable", "teacher", teacherId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TeacherSlotRow[] }>(
        "/timetable/get-teacher-timetable",
        { params: { teacherId } },
      );
      return data.data;
    },
    enabled: !!teacherId,
  });
}

export function useSaveClassTimetable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { classId: string; slots: SlotInput[] }) => {
      const { data } = await apiClient.post<{ data: TimetableSlot[] }>(
        "/timetable/create-class-timetable",
        input,
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timetable", "class", variables.classId] });
    },
  });
}

export function useAssignSubstitute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { slotId: string; teacherId: string }) => {
      const { data } = await apiClient.post<TimetableSlot>("/timetable/assign-substitute", input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timetable"] }),
  });
}
