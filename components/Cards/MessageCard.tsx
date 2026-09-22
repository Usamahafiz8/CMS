import type { Message, User } from "@/generated/prisma/client";

type MessageRow = Message & { sender: User };

interface MessageCardProps {
  message: MessageRow;
  isOwn: boolean;
}

export default function MessageCard({ message, isOwn }: MessageCardProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
          isOwn ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
        }`}
      >
        {!isOwn && <p className="mb-1 text-xs font-semibold opacity-70">{message.sender.firstName}</p>}
        <p>{message.content}</p>
        <p className={`mt-1 text-[10px] ${isOwn ? "text-brand-100" : "text-slate-400"}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
