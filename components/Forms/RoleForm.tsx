import { useState } from "react";
import { usePermissionCatalog, groupPermissionsByModule } from "@/hooks/usePermissions";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import type { RoleInput } from "@/hooks/useRoles";

interface RoleFormProps {
  defaultValues?: { name?: string; description?: string; permissionKeys?: string[] };
  onSubmit: (values: RoleInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  readOnly?: boolean;
}

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const labelClass = "block text-sm font-medium text-slate-700";

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function RoleForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Role",
  readOnly = false,
}: RoleFormProps) {
  const { data: permissions, isLoading } = usePermissionCatalog();
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultValues?.permissionKeys ?? []));

  if (isLoading || !permissions) {
    return <LoadingSpinner label="Loading permissions..." />;
  }

  const grouped = groupPermissionsByModule(permissions);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, description, permissionKeys: Array.from(selected) });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Role Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={readOnly}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>Permissions</p>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(grouped).map(([module, modulePermissions]) => (
            <div key={module} className="rounded-md border border-slate-200 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-800">{titleCase(module)}</p>
              <div className="flex flex-col gap-1.5">
                {modulePermissions.map((permission) => (
                  <label key={permission.key} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={selected.has(permission.key)}
                      onChange={() => toggle(permission.key)}
                      disabled={readOnly}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    {titleCase(permission.action)}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
