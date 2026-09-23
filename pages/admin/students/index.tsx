import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Common/AdminLayout";
import Modal from "@/components/Common/Modal";
import ConfirmDialog from "@/components/Common/ConfirmDialog";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Pagination from "@/components/Common/Pagination";
import Toast from "@/components/Common/Toast";
import StudentForm from "@/components/Forms/StudentForm";
import StudentTable from "@/components/Tables/StudentTable";
import { useStudents, useCreateStudent, useDeleteStudent, useStudentSearch } from "@/hooks/useStudent";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";
import type { Student } from "@/generated/prisma/client";

export default function StudentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const { toast, showToast, dismissToast } = useToast();

  const isSearching = search.trim().length > 0;
  const list = useStudents(page, 10);
  const searchResults = useStudentSearch(search);

  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();

  const students = isSearching ? searchResults.data ?? [] : list.data?.data ?? [];
  const isLoading = isSearching ? searchResults.isLoading : list.isLoading;

  return (
    <AdminLayout title="Students">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2.5 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:py-2 sm:text-sm"
        />
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto sm:py-2"
        >
          + Add Student
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading students..." />
      ) : (
        <>
          <StudentTable
            students={students}
            onEdit={(student) => router.push(`/admin/students/${student.id}`)}
            onDelete={(student) => setDeleteTarget(student)}
          />
          {!isSearching && list.data && (
            <Pagination page={page} totalPages={list.data.pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal open={showAddModal} title="Add Student" onClose={() => setShowAddModal(false)}>
        <StudentForm
          isSubmitting={createStudent.isPending}
          onSubmit={(values) => {
            createStudent.mutate(values, {
              onSuccess: () => {
                setShowAddModal(false);
                showToast("Student added successfully");
              },
              onError: (error) => {
                showToast(error instanceof ApiClientError ? error.message : "Failed to add student", "error");
              },
            });
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This cannot be undone.`}
        isLoading={deleteStudent.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteStudent.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
              showToast("Student deleted");
            },
            onError: (error) => {
              showToast(error instanceof ApiClientError ? error.message : "Failed to delete student", "error");
              setDeleteTarget(null);
            },
          });
        }}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
