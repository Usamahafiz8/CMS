import { useState } from "react";
import Link from "next/link";
import Toast from "@/components/Common/Toast";
import AnnouncementCard from "@/components/Cards/AnnouncementCard";
import { useMyParentProfile, useLinkChild } from "@/hooks/useMyProfile";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function ParentDashboard() {
  const { data: parent } = useMyParentProfile();
  const announcements = useAnnouncements(1, 5);
  const linkChild = useLinkChild();
  const { toast, showToast, dismissToast } = useToast();
  const [rollNumber, setRollNumber] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">My Children</h2>
        {(parent?.children.length ?? 0) === 0 ? (
          <p className="mb-4 text-sm text-slate-500">No children linked to your account yet.</p>
        ) : (
          <ul className="mb-4 divide-y divide-slate-100">
            {parent?.children.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">
                  {c.firstName} {c.lastName} ({c.rollNumber})
                </span>
                <Link href="/parent/child-attendance" className="font-medium text-brand-600 hover:text-brand-800">
                  View Details
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Child's roll number"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={!rollNumber || linkChild.isPending}
            onClick={() => {
              linkChild.mutate(rollNumber, {
                onSuccess: () => {
                  showToast("Child linked to your account");
                  setRollNumber("");
                },
                onError: (error) =>
                  showToast(error instanceof ApiClientError ? error.message : "Failed to link child", "error"),
              });
            }}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Link Child
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Recent Announcements</h2>
        <div className="flex flex-col gap-3">
          {announcements.data?.data.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
        </div>
      </div>

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </div>
  );
}
