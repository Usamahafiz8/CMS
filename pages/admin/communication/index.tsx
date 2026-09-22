import { useState } from "react";
import AdminLayout from "@/components/Common/AdminLayout";
import Modal from "@/components/Common/Modal";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import AnnouncementForm from "@/components/Forms/AnnouncementForm";
import AnnouncementCard from "@/components/Cards/AnnouncementCard";
import MessagingPanel from "@/components/Common/MessagingPanel";
import { useAnnouncements, useCreateAnnouncement } from "@/hooks/useAnnouncements";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function CommunicationPage() {
  const [tab, setTab] = useState<"announcements" | "messages">("announcements");
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const announcements = useAnnouncements(1, 20);
  const createAnnouncement = useCreateAnnouncement();

  return (
    <AdminLayout title="Communication">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("announcements")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${tab === "announcements" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"}`}
        >
          Announcements
        </button>
        <button
          type="button"
          onClick={() => setTab("messages")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${tab === "messages" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"}`}
        >
          Messages
        </button>
      </div>

      {tab === "announcements" ? (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              + Post Announcement
            </button>
          </div>

          {announcements.isLoading ? (
            <LoadingSpinner label="Loading announcements..." />
          ) : (announcements.data?.data.length ?? 0) === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
              No announcements yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {announcements.data?.data.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
            </div>
          )}

          <Modal open={showAddModal} title="Post Announcement" onClose={() => setShowAddModal(false)}>
            <AnnouncementForm
              isSubmitting={createAnnouncement.isPending}
              onSubmit={(values) => {
                createAnnouncement.mutate(values, {
                  onSuccess: () => {
                    setShowAddModal(false);
                    showToast("Announcement posted");
                  },
                  onError: (error) =>
                    showToast(
                      error instanceof ApiClientError ? error.message : "Failed to post announcement",
                      "error",
                    ),
                });
              }}
            />
          </Modal>
        </div>
      ) : (
        <MessagingPanel />
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
