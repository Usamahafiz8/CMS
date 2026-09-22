import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import ClassForm from "@/components/Forms/ClassForm";
import {
  useClass,
  useUpdateClass,
  useClassStudents,
  useEnrollStudent,
  useClassSubjects,
  useAssignSubjectToClass,
  useClassTeachers,
  useAssignTeacherToClass,
} from "@/hooks/useClass";
import { useStudents } from "@/hooks/useStudent";
import { useTeachers } from "@/hooks/useTeacher";
import { useSubjects } from "@/hooks/useSubject";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

function RelationSection<T extends { id: string }>({
  title,
  items,
  renderLabel,
  options,
  onAssign,
  isAssigning,
  emptyLabel,
}: {
  title: string;
  items: T[];
  renderLabel: (item: T) => string;
  options: T[];
  onAssign: (id: string) => void;
  isAssigning: boolean;
  emptyLabel: string;
}) {
  const [selected, setSelected] = useState("");
  const assignedIds = new Set(items.map((item) => item.id));
  const available = options.filter((option) => !assignedIds.has(option.id));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <ul className="mb-4 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="py-2 text-sm text-slate-700">
              {renderLabel(item)}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Select to add...</option>
          {available.map((option) => (
            <option key={option.id} value={option.id}>
              {renderLabel(option)}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selected || isAssigning}
          onClick={() => {
            onAssign(selected);
            setSelected("");
          }}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function ClassDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { toast, showToast, dismissToast } = useToast();

  const { data: classItem, isLoading } = useClass(id);
  const updateClass = useUpdateClass(id ?? "");

  const classStudents = useClassStudents(id);
  const enrollStudent = useEnrollStudent(id ?? "");
  const allStudents = useStudents(1, 100);

  const classSubjects = useClassSubjects(id);
  const assignSubject = useAssignSubjectToClass(id ?? "");
  const allSubjects = useSubjects(1, 100);

  const classTeachers = useClassTeachers(id);
  const assignTeacher = useAssignTeacherToClass(id ?? "");
  const allTeachers = useTeachers(1, 100);

  return (
    <AdminLayout title="Edit Class">
      <Link href="/admin/classes" className="mb-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-800">
        ← Back to Classes
      </Link>

      {isLoading || !classItem ? (
        <LoadingSpinner label="Loading class..." />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="max-w-3xl rounded-lg border border-slate-200 bg-white p-6">
            <ClassForm
              defaultValues={classItem}
              submitLabel="Update Class"
              isSubmitting={updateClass.isPending}
              onSubmit={(values) => {
                updateClass.mutate(values, {
                  onSuccess: () => showToast("Class updated successfully"),
                  onError: (error) => {
                    showToast(
                      error instanceof ApiClientError ? error.message : "Failed to update class",
                      "error",
                    );
                  },
                });
              }}
            />
          </div>

          <RelationSection
            title="Enrolled Students"
            items={classStudents.data ?? []}
            renderLabel={(s) => `${s.firstName} ${s.lastName} (${s.rollNumber})`}
            options={allStudents.data?.data ?? []}
            isAssigning={enrollStudent.isPending}
            emptyLabel="No students enrolled yet."
            onAssign={(studentId) =>
              enrollStudent.mutate(studentId, {
                onSuccess: () => showToast("Student enrolled"),
                onError: (error) =>
                  showToast(error instanceof ApiClientError ? error.message : "Failed to enroll student", "error"),
              })
            }
          />

          <RelationSection
            title="Assigned Subjects"
            items={classSubjects.data ?? []}
            renderLabel={(s) => `${s.name} (${s.code})`}
            options={allSubjects.data?.data ?? []}
            isAssigning={assignSubject.isPending}
            emptyLabel="No subjects assigned yet."
            onAssign={(subjectId) =>
              assignSubject.mutate(subjectId, {
                onSuccess: () => showToast("Subject assigned"),
                onError: (error) =>
                  showToast(error instanceof ApiClientError ? error.message : "Failed to assign subject", "error"),
              })
            }
          />

          <RelationSection
            title="Assigned Teachers"
            items={classTeachers.data ?? []}
            renderLabel={(t) => `${t.firstName} ${t.lastName} (${t.employeeId})`}
            options={allTeachers.data?.data ?? []}
            isAssigning={assignTeacher.isPending}
            emptyLabel="No teachers assigned yet."
            onAssign={(teacherId) =>
              assignTeacher.mutate(teacherId, {
                onSuccess: () => showToast("Teacher assigned"),
                onError: (error) =>
                  showToast(error instanceof ApiClientError ? error.message : "Failed to assign teacher", "error"),
              })
            }
          />
        </div>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
