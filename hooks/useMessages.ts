import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Message, User } from "@/generated/prisma/client";

type MessageRow = Message & { sender: User; recipient: User };

export function useConversation(withUserId: string | undefined) {
  return useQuery({
    queryKey: ["messages", withUserId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: MessageRow[] }>("/communication/messages/get", {
        params: { withUserId },
      });
      return data.data;
    },
    enabled: !!withUserId,
    refetchInterval: 10_000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { recipientId: string; content: string; studentId?: string }) => {
      const { data } = await apiClient.post<Message>("/communication/messages/send", input);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.recipientId] });
    },
  });
}
