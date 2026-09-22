import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Notification } from "@/generated/prisma/client";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Notification[] }>("/communication/notifications/get");
      return data.data;
    },
    refetchInterval: 30_000,
  });
}
