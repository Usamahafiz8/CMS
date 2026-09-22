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
    <div className="overflow-x-auto rounded-md border border-slate-200">
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
  );
}
