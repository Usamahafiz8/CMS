import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Common/AdminLayout";
import Modal from "@/components/Common/Modal";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Pagination from "@/components/Common/Pagination";
import Toast from "@/components/Common/Toast";
import UserForm from "@/components/Forms/UserForm";
import ResetPasswordForm from "@/components/Forms/ResetPasswordForm";
import UserTable from "@/components/Tables/UserTable";
import { useAdminUsers, useCreateUser, useUpdateUserStatus, useAdminResetPassword, type AdminUser } from "@/hooks/useUsers";
import { useCurrentUser } from "@/hooks/useAuth";
import { useCan } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const { toast, showToast, dismissToast } = useToast();
  const can = useCan();

  const { data: currentUser } = useCurrentUser();
  const list = useAdminUsers(page, 10);
  const createUser = useCreateUser();
  const resetPassword = useAdminResetPassword();
  const updateStatus = useUpdateUserStatus();

  return (
    <AdminLayout title="Users">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Manage accounts and assign roles across the system.</p>
        {can("users.create") && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto sm:py-2"
          >
            + Add User
          </button>
        )}
      </div>

      {list.isLoading ? (
        <LoadingSpinner label="Loading users..." />
      ) : (
        <>
          <UserTable
            users={list.data?.data ?? []}
            currentUserId={currentUser?.id}
            onEdit={(user) => router.push(`/admin/users/${user.id}`)}
            onResetPassword={(user) => setResetTarget(user)}
            onToggleStatus={(user) => {
              const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
              updateStatus.mutate(
                { id: user.id, status: nextStatus },
                {
                  onSuccess: () => showToast(nextStatus === "ACTIVE" ? "User activated" : "User deactivated"),
                  onError: (error) => {
                    showToast(
                      error instanceof ApiClientError ? error.message : "Failed to update user status",
                      "error",
                    );
                  },
                },
              );
            }}
          />
          {list.data && (
            <Pagination page={page} totalPages={list.data.pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal open={showAddModal} title="Add User" onClose={() => setShowAddModal(false)}>
        <UserForm
          isSubmitting={createUser.isPending}
          onSubmit={(values) => {
            createUser.mutate(values, {
              onSuccess: () => {
                setShowAddModal(false);
                showToast("User added successfully");
              },
              onError: (error) => {
                showToast(error instanceof ApiClientError ? error.message : "Failed to add user", "error");
              },
            });
          }}
        />
      </Modal>

      <Modal
        open={!!resetTarget}
        title={`Reset Password — ${resetTarget?.firstName ?? ""} ${resetTarget?.lastName ?? ""}`}
        onClose={() => setResetTarget(null)}
      >
        <ResetPasswordForm
          isSubmitting={resetPassword.isPending}
          onSubmit={(newPassword) => {
            if (!resetTarget) return;
            resetPassword.mutate(
              { userId: resetTarget.id, newPassword },
              {
                onSuccess: () => {
                  setResetTarget(null);
                  showToast("Password reset successfully");
                },
                onError: (error) => {
                  showToast(error instanceof ApiClientError ? error.message : "Failed to reset password", "error");
                },
              },
            );
          }}
        />
      </Modal>

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
