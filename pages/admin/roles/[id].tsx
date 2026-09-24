import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import RoleForm from "@/components/Forms/RoleForm";
import { useRole, useUpdateRole } from "@/hooks/useRoles";
import { useCan } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function RoleDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { data: role, isLoading } = useRole(id);
  const updateRole = useUpdateRole(id ?? "");
  const { toast, showToast, dismissToast } = useToast();
  const can = useCan();

  const isSuperAdmin = role?.key === "SUPER_ADMIN";

  return (
    <AdminLayout title="Edit Role">
      <Link href="/admin/roles" className="mb-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-800">
        ← Back to Roles
      </Link>

      {isLoading || !role ? (
        <LoadingSpinner label="Loading role..." />
      ) : (
        <div className="max-w-3xl rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          {isSuperAdmin && (
            <p className="mb-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
              The Super Admin role always holds every permission and can&apos;t be modified.
            </p>
          )}
          <RoleForm
            readOnly={isSuperAdmin || !can("roles.edit")}
            defaultValues={{
              name: role.name,
              description: role.description ?? undefined,
              permissionKeys: role.permissionKeys,
            }}
            submitLabel="Update Role"
            isSubmitting={updateRole.isPending}
            onSubmit={(values) => {
              updateRole.mutate(values, {
                onSuccess: () => showToast("Role updated successfully"),
                onError: (error) => {
                  showToast(error instanceof ApiClientError ? error.message : "Failed to update role", "error");
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
