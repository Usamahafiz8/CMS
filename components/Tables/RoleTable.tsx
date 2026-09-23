import type { RoleWithPermissions } from "@/hooks/useRoles";
import { useCan } from "@/hooks/usePermissions";

interface RoleTableProps {
  roles: RoleWithPermissions[];
  onEdit: (role: RoleWithPermissions) => void;
  onDelete: (role: RoleWithPermissions) => void;
}

export default function RoleTable({ roles, onEdit, onDelete }: RoleTableProps) {
  const can = useCan();

  if (roles.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No roles found.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-md border border-slate-200 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Permissions</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Users</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {roles.map((role) => {
              const isSuperAdmin = role.key === "SUPER_ADMIN";
              return (
                <tr key={role.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {role.name}
                    {role.isSystem && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{role.description ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{role.permissionKeys.length}</td>
                  <td className="px-4 py-3 text-slate-600">{role._count.users}</td>
                  <td className="px-4 py-3 text-right">
                    {can("roles.edit") && !isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => onEdit(role)}
                        className="mr-3 font-medium text-brand-600 hover:text-brand-800"
                      >
                        Edit
                      </button>
                    )}
                    {can("roles.view") && (isSuperAdmin || !can("roles.edit")) && (
                      <button
                        type="button"
                        onClick={() => onEdit(role)}
                        className="mr-3 font-medium text-brand-600 hover:text-brand-800"
                      >
                        View
                      </button>
                    )}
                    {can("roles.delete") && !role.isSystem && role._count.users === 0 && (
                      <button
                        type="button"
                        onClick={() => onDelete(role)}
                        className="font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        {roles.map((role) => {
          const isSuperAdmin = role.key === "SUPER_ADMIN";
          const canEdit = can("roles.edit") && !isSuperAdmin;
          const canView = can("roles.view") && (isSuperAdmin || !can("roles.edit"));
          const canDelete = can("roles.delete") && !role.isSystem && role._count.users === 0;
          return (
            <div key={role.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {role.name}
                    {role.isSystem && (
                      <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                        System
                      </span>
                    )}
                  </p>
                  {role.description && <p className="mt-0.5 text-sm text-slate-500">{role.description}</p>}
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-y-2 border-t border-slate-100 pt-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Permissions</dt>
                  <dd className="text-slate-700">{role.permissionKeys.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Users</dt>
                  <dd className="text-slate-700">{role._count.users}</dd>
                </div>
              </dl>
              {(canEdit || canView || canDelete) && (
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  {(canEdit || canView) && (
                    <button
                      type="button"
                      onClick={() => onEdit(role)}
                      className="min-h-10 flex-1 rounded-md border border-slate-300 text-sm font-medium text-brand-600 hover:bg-brand-50"
                    >
                      {canEdit ? "Edit" : "View"}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(role)}
                      className="min-h-10 flex-1 rounded-md border border-slate-300 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
