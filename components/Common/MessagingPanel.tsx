import { useState } from "react";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import MessageCard from "@/components/Cards/MessageCard";
import { useConversation, useSendMessage } from "@/hooks/useMessages";
import { useUsers } from "@/hooks/useUsers";
import { useCurrentUser } from "@/hooks/useAuth";

export default function MessagingPanel() {
  const [recipientId, setRecipientId] = useState("");
  const [draft, setDraft] = useState("");

  const { data: me } = useCurrentUser();
  const users = useUsers();
  const conversation = useConversation(recipientId || undefined);
  const sendMessage = useSendMessage();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      <div className="w-full shrink-0 rounded-md border border-slate-200 bg-white md:w-64">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          Contacts
        </div>
        <ul className="max-h-96 overflow-y-auto">
          {users.data?.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => setRecipientId(u.id)}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  recipientId === u.id ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {u.firstName} {u.lastName}
                <span className="ml-1 text-xs text-slate-400">({u.role})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 rounded-md border border-slate-200 bg-white p-4">
        {!recipientId ? (
          <p className="text-sm text-slate-500">Select a contact to start messaging.</p>
        ) : (
          <div className="flex h-96 flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto">
              {conversation.isLoading ? (
                <LoadingSpinner label="Loading messages..." />
              ) : (
                conversation.data?.map((m) => (
                  <MessageCard key={m.id} message={m} isOwn={m.senderId === me?.id} />
                ))
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={!draft.trim() || sendMessage.isPending}
                onClick={() => {
                  sendMessage.mutate(
                    { recipientId, content: draft },
                    { onSuccess: () => setDraft("") },
                  );
                }}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
