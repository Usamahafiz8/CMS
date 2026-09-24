import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import StudentForm from "@/components/Forms/StudentForm";
import { useStudent, useUpdateStudent } from "@/hooks/useStudent";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function StudentDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { data: student, isLoading } = useStudent(id);
  const updateStudent = useUpdateStudent(id ?? "");
  const { toast, showToast, dismissToast } = useToast();

  return (
    <AdminLayout title="Edit Student">
      <Link href="/admin/students" className="mb-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-800">
        ← Back to Students
      </Link>

      {isLoading || !student ? (
        <LoadingSpinner label="Loading student..." />
      ) : (
        <div className="max-w-3xl rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <StudentForm
            defaultValues={{
              ...student,
              dateOfBirth: new Date(student.dateOfBirth).toISOString().slice(0, 10),
              phone: student.phone ?? undefined,
              email: student.email ?? undefined,
              address: student.address ?? undefined,
              profilePic: student.profilePic ?? undefined,
            }}
            submitLabel="Update Student"
            isSubmitting={updateStudent.isPending}
            onSubmit={(values) => {
              updateStudent.mutate(values, {
                onSuccess: () => showToast("Student updated successfully"),
                onError: (error) => {
                  showToast(
                    error instanceof ApiClientError ? error.message : "Failed to update student",
                    "error",
                  );
                },
              });
            }}
          />
        </div>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
