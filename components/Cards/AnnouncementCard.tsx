import type { Announcement, User } from "@/generated/prisma/client";

type AnnouncementRow = Announcement & { createdBy: User };

interface AnnouncementCardProps {
  announcement: AnnouncementRow;
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "border-red-300 bg-red-50 text-red-700",
  MEDIUM: "border-amber-300 bg-amber-50 text-amber-700",
  LOW: "border-slate-300 bg-slate-50 text-slate-600",
};

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <div className="cms-card-hover rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{announcement.title}</h3>
        <span
          className={`rounded-full border px-2 py-1 text-xs font-medium ${PRIORITY_STYLES[announcement.priority]}`}
        >
          {announcement.priority}
        </span>
      </div>
      <p className="text-sm text-slate-600">{announcement.content}</p>
      <p className="mt-3 text-xs text-slate-400">
        {announcement.createdBy.firstName} {announcement.createdBy.lastName} ·{" "}
        {new Date(announcement.createdAt).toLocaleDateString()}
        {announcement.targetRole ? ` · ${announcement.targetRole}s only` : " · Everyone"}
      </p>
    </div>
  );
}
