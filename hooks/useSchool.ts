import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { School } from "@/generated/prisma/client";

export function useMySchool() {
  return useQuery({
    queryKey: ["school", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<School>("/schools/me");
      return data;
    },
  });
}
