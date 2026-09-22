import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Common/AdminLayout";
import Modal from "@/components/Common/Modal";
import ConfirmDialog from "@/components/Common/ConfirmDialog";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Pagination from "@/components/Common/Pagination";
import Toast from "@/components/Common/Toast";
import ClassForm from "@/components/Forms/ClassForm";
import ClassTable from "@/components/Tables/ClassTable";
import { useClasses, useCreateClass, useDeleteClass } from "@/hooks/useClass";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";
import type { Class } from "@/generated/prisma/client";

type ClassRow = Class & { _count: { enrollments: number } };

export default function ClassesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassRow | null>(null);
  const { toast, showToast, dismissToast } = useToast();

  const list = useClasses(page, 10);
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();

  return (
    <AdminLayout title="Classes">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Add Class
        </button>
      </div>

      {list.isLoading ? (
        <LoadingSpinner label="Loading classes..." />
      ) : (
        <>
          <ClassTable
            classes={list.data?.data ?? []}
            onEdit={(classItem) => router.push(`/admin/classes/${classItem.id}`)}
            onDelete={(classItem) => setDeleteTarget(classItem)}
          />
          {list.data && (
            <Pagination page={page} totalPages={list.data.pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal open={showAddModal} title="Add Class" onClose={() => setShowAddModal(false)}>
        <ClassForm
          isSubmitting={createClass.isPending}
          onSubmit={(values) => {
            createClass.mutate(values, {
              onSuccess: () => {
                setShowAddModal(false);
                showToast("Class added successfully");
              },
              onError: (error) => {
                showToast(error instanceof ApiClientError ? error.message : "Failed to add class", "error");
              },
            });
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Class"
        message={`Are you sure you want to delete ${deleteTarget?.name} - ${deleteTarget?.section}? This cannot be undone.`}
        isLoading={deleteClass.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteClass.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
              showToast("Class deleted");
            },
            onError: (error) => {
              showToast(error instanceof ApiClientError ? error.message : "Failed to delete class", "error");
              setDeleteTarget(null);
            },
          });
        }}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
