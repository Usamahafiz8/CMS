import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import TeacherForm from "@/components/Forms/TeacherForm";
import { useTeacher, useUpdateTeacher } from "@/hooks/useTeacher";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function TeacherDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { data: teacher, isLoading } = useTeacher(id);
  const updateTeacher = useUpdateTeacher(id ?? "");
  const { toast, showToast, dismissToast } = useToast();

  return (
    <AdminLayout title="Edit Teacher">
      <Link href="/admin/teachers" className="mb-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-800">
        ← Back to Teachers
      </Link>

      {isLoading || !teacher ? (
        <LoadingSpinner label="Loading teacher..." />
      ) : (
        <div className="max-w-3xl rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <TeacherForm
            defaultValues={{
              ...teacher,
              phone: teacher.phone ?? undefined,
              email: teacher.email ?? undefined,
              qualifications: teacher.qualifications ?? undefined,
              experience: teacher.experience ?? undefined,
              address: teacher.address ?? undefined,
              profilePic: teacher.profilePic ?? undefined,
            }}
            submitLabel="Update Teacher"
            isSubmitting={updateTeacher.isPending}
            onSubmit={(values) => {
              updateTeacher.mutate(values, {
                onSuccess: () => showToast("Teacher updated successfully"),
                onError: (error) => {
                  showToast(
                    error instanceof ApiClientError ? error.message : "Failed to update teacher",
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
