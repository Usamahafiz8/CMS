import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Announcement, User } from "@/generated/prisma/client";
import type { AnnouncementInput } from "@/components/Forms/AnnouncementForm";

type AnnouncementRow = Announcement & { createdBy: User };

export function useAnnouncements(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["announcements", { page, pageSize }],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<AnnouncementRow>>("/communication/announcements", {
        params: { page, pageSize },
      });
      return data;
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AnnouncementInput) => {
      const { data } = await apiClient.post<Announcement>("/communication/announcements", input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/communication/announcements/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}
