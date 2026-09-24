import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Common/AdminLayout";
import Modal from "@/components/Common/Modal";
import ConfirmDialog from "@/components/Common/ConfirmDialog";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import RoleForm from "@/components/Forms/RoleForm";
import RoleTable from "@/components/Tables/RoleTable";
import { useRoles, useCreateRole, useDeleteRole, type RoleWithPermissions } from "@/hooks/useRoles";
import { useCan } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function RolesPage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleWithPermissions | null>(null);
  const { toast, showToast, dismissToast } = useToast();
  const can = useCan();

  const roles = useRoles();
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();

  return (
    <AdminLayout title="Roles">
      <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Define custom roles and control which permissions each one grants.</p>
        {can("roles.create") && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto sm:py-2"
          >
            + Create Role
          </button>
        )}
      </div>

      {roles.isLoading ? (
        <LoadingSpinner label="Loading roles..." />
      ) : (
        <RoleTable
          roles={roles.data ?? []}
          onEdit={(role) => router.push(`/admin/roles/${role.id}`)}
          onDelete={(role) => setDeleteTarget(role)}
        />
      )}

      <Modal open={showAddModal} title="Create Role" onClose={() => setShowAddModal(false)}>
        <RoleForm
          isSubmitting={createRole.isPending}
          onSubmit={(values) => {
            createRole.mutate(values, {
              onSuccess: () => {
                setShowAddModal(false);
                showToast("Role created successfully");
              },
              onError: (error) => {
                showToast(error instanceof ApiClientError ? error.message : "Failed to create role", "error");
              },
            });
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Role"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        isLoading={deleteRole.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteRole.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
              showToast("Role deleted");
            },
            onError: (error) => {
              showToast(error instanceof ApiClientError ? error.message : "Failed to delete role", "error");
              setDeleteTarget(null);
            },
          });
        }}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
