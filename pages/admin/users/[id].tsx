import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import UserForm from "@/components/Forms/UserForm";
import { useAdminUser, useUpdateUser } from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function UserDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { data: user, isLoading } = useAdminUser(id);
  const updateUser = useUpdateUser(id ?? "");
  const { toast, showToast, dismissToast } = useToast();

  return (
    <AdminLayout title="Edit User">
      <Link href="/admin/users" className="mb-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-800">
        ← Back to Users
      </Link>

      {isLoading || !user ? (
        <LoadingSpinner label="Loading user..." />
      ) : (
        <div className="max-w-3xl rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <UserForm
            isEdit
            defaultValues={{
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone ?? undefined,
              roleId: user.role.id,
              status: user.status,
            }}
            submitLabel="Update User"
            isSubmitting={updateUser.isPending}
            onSubmit={(values) => {
              updateUser.mutate(
                {
                  firstName: values.firstName,
                  lastName: values.lastName,
                  phone: values.phone,
                  roleId: values.roleId,
                  status: values.status,
                },
                {
                  onSuccess: () => showToast("User updated successfully"),
                  onError: (error) => {
                    showToast(error instanceof ApiClientError ? error.message : "Failed to update user", "error");
                  },
                },
              );
            }}
          />
        </div>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
