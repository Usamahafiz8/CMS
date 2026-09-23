import { useState } from "react";
import AdminLayout from "@/components/Common/AdminLayout";
import Modal from "@/components/Common/Modal";
import ConfirmDialog from "@/components/Common/ConfirmDialog";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Pagination from "@/components/Common/Pagination";
import Toast from "@/components/Common/Toast";
import SubjectForm from "@/components/Forms/SubjectForm";
import SubjectTable from "@/components/Tables/SubjectTable";
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from "@/hooks/useSubject";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";
import type { Subject } from "@/generated/prisma/client";

export default function SubjectsPage() {
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const { toast, showToast, dismissToast } = useToast();

  const list = useSubjects(page, 10);
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject(editTarget?.id ?? "");
  const deleteSubject = useDeleteSubject();

  return (
    <AdminLayout title="Subjects">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto sm:py-2"
        >
          + Add Subject
        </button>
      </div>

      {list.isLoading ? (
        <LoadingSpinner label="Loading subjects..." />
      ) : (
        <>
          <SubjectTable
            subjects={list.data?.data ?? []}
            onEdit={(subject) => setEditTarget(subject)}
            onDelete={(subject) => setDeleteTarget(subject)}
          />
          {list.data && (
            <Pagination page={page} totalPages={list.data.pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal open={showAddModal} title="Add Subject" onClose={() => setShowAddModal(false)}>
        <SubjectForm
          isSubmitting={createSubject.isPending}
          onSubmit={(values) => {
            createSubject.mutate(values, {
              onSuccess: () => {
                setShowAddModal(false);
                showToast("Subject added successfully");
              },
              onError: (error) => {
                showToast(error instanceof ApiClientError ? error.message : "Failed to add subject", "error");
              },
            });
          }}
        />
      </Modal>

      <Modal open={!!editTarget} title="Edit Subject" onClose={() => setEditTarget(null)}>
        {editTarget && (
          <SubjectForm
            defaultValues={editTarget}
            submitLabel="Update Subject"
            isSubmitting={updateSubject.isPending}
            onSubmit={(values) => {
              updateSubject.mutate(values, {
                onSuccess: () => {
                  setEditTarget(null);
                  showToast("Subject updated successfully");
                },
                onError: (error) => {
                  showToast(
                    error instanceof ApiClientError ? error.message : "Failed to update subject",
                    "error",
                  );
                },
              });
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subject"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This cannot be undone.`}
        isLoading={deleteSubject.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteSubject.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
              showToast("Subject deleted");
            },
            onError: (error) => {
              showToast(error instanceof ApiClientError ? error.message : "Failed to delete subject", "error");
              setDeleteTarget(null);
            },
          });
        }}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
