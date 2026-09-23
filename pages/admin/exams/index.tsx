import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/Common/AdminLayout";
import Modal from "@/components/Common/Modal";
import ConfirmDialog from "@/components/Common/ConfirmDialog";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import ExamForm from "@/components/Forms/ExamForm";
import { useExams, useCreateExam, useDeleteExam } from "@/hooks/useExam";
import { useClasses } from "@/hooks/useClass";
import { useSubjects } from "@/hooks/useSubject";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";
import type { Class, Exam, Subject } from "@/generated/prisma/client";

type ExamRow = Exam & { class: Class; subjects: Subject[] };

export default function ExamsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExamRow | null>(null);
  const { toast, showToast, dismissToast } = useToast();

  const exams = useExams(1, 20);
  const classes = useClasses(1, 100);
  const subjects = useSubjects(1, 100);
  const createExam = useCreateExam();
  const deleteExam = useDeleteExam();

  return (
    <AdminLayout title="Exams">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto sm:py-2"
        >
          + Create Exam
        </button>
      </div>

      {exams.isLoading ? (
        <LoadingSpinner label="Loading exams..." />
      ) : (exams.data?.data.length ?? 0) === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
          No exams found. Create one to get started.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Dates</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {exams.data?.data.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{exam.name}</td>
                  <td className="px-4 py-3 text-slate-600">{exam.type.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {exam.class.name} - {exam.class.section}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(exam.startDate).toLocaleDateString()} -{" "}
                    {new Date(exam.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/exams/${exam.id}`}
                      className="mr-3 font-medium text-brand-600 hover:text-brand-800"
                    >
                      Manage
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(exam)}
                      className="font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showAddModal} title="Create Exam" onClose={() => setShowAddModal(false)}>
        <ExamForm
          classes={classes.data?.data ?? []}
          subjects={subjects.data?.data ?? []}
          isSubmitting={createExam.isPending}
          onSubmit={(values) => {
            createExam.mutate(values, {
              onSuccess: () => {
                setShowAddModal(false);
                showToast("Exam created successfully");
              },
              onError: (error) => {
                showToast(error instanceof ApiClientError ? error.message : "Failed to create exam", "error");
              },
            });
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Exam"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This cannot be undone.`}
        isLoading={deleteExam.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteExam.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
              showToast("Exam deleted");
            },
            onError: (error) => {
              showToast(error instanceof ApiClientError ? error.message : "Failed to delete exam", "error");
              setDeleteTarget(null);
            },
          });
        }}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
