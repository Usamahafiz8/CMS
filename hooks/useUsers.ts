import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface DirectoryUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
}

export function useUsers(role?: DirectoryUser["role"]) {
  return useQuery({
    queryKey: ["users", role],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: DirectoryUser[] }>("/users", { params: { role } });
      return data.data;
    },
  });
}
