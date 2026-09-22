import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Common/AdminLayout";
import Modal from "@/components/Common/Modal";
import ConfirmDialog from "@/components/Common/ConfirmDialog";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Pagination from "@/components/Common/Pagination";
import Toast from "@/components/Common/Toast";
import TeacherForm from "@/components/Forms/TeacherForm";
import TeacherTable from "@/components/Tables/TeacherTable";
import { useTeachers, useCreateTeacher, useDeleteTeacher, useTeacherSearch } from "@/hooks/useTeacher";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";
import type { Teacher } from "@/generated/prisma/client";

export default function TeachersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const { toast, showToast, dismissToast } = useToast();

  const isSearching = search.trim().length > 0;
  const list = useTeachers(page, 10);
  const searchResults = useTeacherSearch(search);

  const createTeacher = useCreateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const teachers = isSearching ? searchResults.data ?? [] : list.data?.data ?? [];
  const isLoading = isSearching ? searchResults.isLoading : list.isLoading;

  return (
    <AdminLayout title="Teachers">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search by name or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Add Teacher
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading teachers..." />
      ) : (
        <>
          <TeacherTable
            teachers={teachers}
            onEdit={(teacher) => router.push(`/admin/teachers/${teacher.id}`)}
            onDelete={(teacher) => setDeleteTarget(teacher)}
          />
          {!isSearching && list.data && (
            <Pagination page={page} totalPages={list.data.pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal open={showAddModal} title="Add Teacher" onClose={() => setShowAddModal(false)}>
        <TeacherForm
          isSubmitting={createTeacher.isPending}
          onSubmit={(values) => {
            createTeacher.mutate(values, {
              onSuccess: () => {
                setShowAddModal(false);
                showToast("Teacher added successfully");
              },
              onError: (error) => {
                showToast(error instanceof ApiClientError ? error.message : "Failed to add teacher", "error");
              },
            });
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This cannot be undone.`}
        isLoading={deleteTeacher.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTeacher.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
              showToast("Teacher deleted");
            },
            onError: (error) => {
              showToast(error instanceof ApiClientError ? error.message : "Failed to delete teacher", "error");
              setDeleteTarget(null);
            },
          });
        }}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
