import type { AdminUser } from "@/hooks/useUsers";
import { useCan } from "@/hooks/usePermissions";

interface UserTableProps {
  users: AdminUser[];
  currentUserId?: string;
  onEdit: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
}

export default function UserTable({ users, currentUserId, onEdit, onResetPassword, onToggleStatus }: UserTableProps) {
  const can = useCan();

  if (users.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No users found. Add a user to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Role</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {user.firstName} {user.lastName}
                  {isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                </td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3 text-slate-600">{user.role.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {can("users.edit") && (
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="mr-3 font-medium text-brand-600 hover:text-brand-800"
                    >
                      Edit
                    </button>
                  )}
                  {can("users.changePassword") && (
                    <button
                      type="button"
                      onClick={() => onResetPassword(user)}
                      className="mr-3 font-medium text-brand-600 hover:text-brand-800"
                    >
                      Reset Password
                    </button>
                  )}
                  {can("users.delete") && !isSelf && (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(user)}
                      className="font-medium text-red-600 hover:text-red-800"
                    >
                      {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
