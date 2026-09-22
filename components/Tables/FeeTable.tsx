import type { Fee, Student } from "@/generated/prisma/client";
import { formatCurrency } from "@/lib/helpers";

type FeeRow = Fee & { student: Student };

interface FeeTableProps {
  fees: FeeRow[];
  onRecordPayment?: (fee: FeeRow) => void;
  onSendReminder?: (fee: FeeRow) => void;
  isRecording?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default function FeeTable({ fees, onRecordPayment, onSendReminder, isRecording }: FeeTableProps) {
  if (fees.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No invoices found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Amount</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Due Date</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {fees.map((fee) => (
            <tr key={fee.id} className="transition-colors hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">
                {fee.student.firstName} {fee.student.lastName}
              </td>
              <td className="px-4 py-3 text-slate-600">{fee.feeType}</td>
              <td className="px-4 py-3 text-slate-600">{formatCurrency(fee.amount)}</td>
              <td className="px-4 py-3 text-slate-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[fee.status]}`}>
                  {fee.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {fee.status !== "PAID" && (onRecordPayment || onSendReminder) && (
                  <>
                    {onRecordPayment && (
                      <button
                        type="button"
                        disabled={isRecording}
                        onClick={() => onRecordPayment(fee)}
                        className="mr-3 font-medium text-brand-600 hover:text-brand-800 disabled:opacity-50"
                      >
                        Record Payment
                      </button>
                    )}
                    {onSendReminder && (
                      <button
                        type="button"
                        onClick={() => onSendReminder(fee)}
                        className="font-medium text-amber-600 hover:text-amber-800"
                      >
                        Send Reminder
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
