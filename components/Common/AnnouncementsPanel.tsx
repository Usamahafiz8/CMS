import { useState } from "react";
import Modal from "@/components/Common/Modal";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import AnnouncementForm from "@/components/Forms/AnnouncementForm";
import AnnouncementCard from "@/components/Cards/AnnouncementCard";
import { useAnnouncements, useCreateAnnouncement } from "@/hooks/useAnnouncements";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

interface AnnouncementsPanelProps {
  canPost?: boolean;
}

export default function AnnouncementsPanel({ canPost = false }: AnnouncementsPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const announcements = useAnnouncements(1, 20);
  const createAnnouncement = useCreateAnnouncement();

  return (
    <div>
      {canPost && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto sm:py-2"
          >
            + Post Announcement
          </button>
        </div>
      )}

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

      {canPost && (
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
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </div>
  );
}
