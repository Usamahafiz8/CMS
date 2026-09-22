import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Class, ClassAssignment, ClassEnrollment, Parent, Student, Teacher } from "@/generated/prisma/client";

type MyStudent = Student & { classEnrollments: (ClassEnrollment & { class: Class })[] };
type MyTeacher = Teacher & { classAssignments: (ClassAssignment & { class: Class })[] };
type MyParent = Parent & { children: MyStudent[] };

export function useMyStudentProfile() {
  return useQuery({
    queryKey: ["my-student-profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<MyStudent>("/students/me");
      return data;
    },
  });
}

export function useMyTeacherProfile() {
  return useQuery({
    queryKey: ["my-teacher-profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<MyTeacher>("/teachers/me");
      return data;
    },
  });
}

export function useMyParentProfile() {
  return useQuery({
    queryKey: ["my-parent-profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<MyParent>("/parents/me");
      return data;
    },
  });
}

export function useLinkChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rollNumber: string) => {
      const { data } = await apiClient.post<MyParent>("/parents/link-child", { rollNumber });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-parent-profile"] }),
  });
}
