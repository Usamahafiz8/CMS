import { useState } from "react";
import AdminLayout from "@/components/Common/AdminLayout";
import Modal from "@/components/Common/Modal";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import FeeStructureForm from "@/components/Forms/FeeStructureForm";
import FeeTable from "@/components/Tables/FeeTable";
import {
  useFeeStructures,
  useCreateFeeStructure,
  useGenerateInvoices,
  useOutstandingFees,
  useRecordPayment,
  useSendFeeReminder,
} from "@/hooks/useFees";
import { useClasses } from "@/hooks/useClass";
import { useStudents } from "@/hooks/useStudent";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/helpers";

export default function FeesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [feeStructureId, setFeeStructureId] = useState("");
  const [targetType, setTargetType] = useState<"class" | "student">("class");
  const [targetId, setTargetId] = useState("");
  const { toast, showToast, dismissToast } = useToast();

  const structures = useFeeStructures();
  const createStructure = useCreateFeeStructure();
  const generateInvoices = useGenerateInvoices();
  const classes = useClasses(1, 100);
  const students = useStudents(1, 100);
  const outstanding = useOutstandingFees();
  const recordPayment = useRecordPayment();
  const sendReminder = useSendFeeReminder();

  return (
    <AdminLayout title="Fee Management">
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">Total Outstanding</p>
          <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {formatCurrency(outstanding.data?.summary.totalOutstanding ?? 0)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">Unpaid Invoices</p>
          <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{outstanding.data?.summary.count ?? 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">Overdue</p>
          <p className="mt-1 text-xl font-bold text-red-600 sm:text-2xl">{outstanding.data?.summary.overdueCount ?? 0}</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900">Fee Structures</h2>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto sm:py-2"
          >
            + New Fee Structure
          </button>
        </div>
        <ul className="mb-4 divide-y divide-slate-100">
          {structures.data?.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-700">
                {s.name} — {formatCurrency(s.amount)} ({s.academicYear})
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
          <select
            value={feeStructureId}
            onChange={(e) => setFeeStructureId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-base sm:w-auto sm:py-2 sm:text-sm"
          >
            <option value="">Select a fee structure...</option>
            {structures.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as "class" | "student")}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-base sm:w-auto sm:py-2 sm:text-sm"
          >
            <option value="class">Whole Class</option>
            <option value="student">Single Student</option>
          </select>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-base sm:w-auto sm:py-2 sm:text-sm"
          >
            <option value="">{targetType === "class" ? "Select a class..." : "Select a student..."}</option>
            {targetType === "class"
              ? classes.data?.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.section}
                  </option>
                ))
              : students.data?.data.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.rollNumber})
                  </option>
                ))}
          </select>
          <button
            type="button"
            disabled={!feeStructureId || !targetId || generateInvoices.isPending}
            onClick={() => {
              generateInvoices.mutate(
                { feeStructureId, ...(targetType === "class" ? { classId: targetId } : { studentId: targetId }) },
                {
                  onSuccess: (data) => showToast(`Generated ${data.data.length} invoice(s)`),
                  onError: (error) =>
                    showToast(
                      error instanceof ApiClientError ? error.message : "Failed to generate invoices",
                      "error",
                    ),
                },
              );
            }}
            className="w-full rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 sm:w-auto sm:py-2"
          >
            Generate Invoices
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Outstanding Invoices</h2>
        {outstanding.isLoading ? (
          <LoadingSpinner label="Loading invoices..." />
        ) : (
          <FeeTable
            fees={outstanding.data?.data ?? []}
            isRecording={recordPayment.isPending}
            onRecordPayment={(fee) =>
              recordPayment.mutate(fee.id, {
                onSuccess: () => showToast("Payment recorded"),
                onError: (error) =>
                  showToast(error instanceof ApiClientError ? error.message : "Failed to record payment", "error"),
              })
            }
            onSendReminder={(fee) =>
              sendReminder.mutate(fee.id, {
                onSuccess: () => showToast("Reminder sent"),
                onError: (error) =>
                  showToast(error instanceof ApiClientError ? error.message : "Failed to send reminder", "error"),
              })
            }
          />
        )}
      </div>

      <Modal open={showAddModal} title="New Fee Structure" onClose={() => setShowAddModal(false)}>
        <FeeStructureForm
          isSubmitting={createStructure.isPending}
          onSubmit={(values) => {
            createStructure.mutate(values, {
              onSuccess: () => {
                setShowAddModal(false);
                showToast("Fee structure created");
              },
              onError: (error) =>
                showToast(
                  error instanceof ApiClientError ? error.message : "Failed to create fee structure",
                  "error",
                ),
            });
          }}
        />
      </Modal>

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
