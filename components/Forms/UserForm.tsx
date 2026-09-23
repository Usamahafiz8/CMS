import { useForm, useWatch } from "react-hook-form";
import { useRoles } from "@/hooks/useRoles";
import type { UserCreateInput } from "@/hooks/useUsers";

interface UserFormProps {
  defaultValues?: Partial<UserCreateInput>;
  onSubmit: (values: UserCreateInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:py-2 sm:text-sm";
const labelClass = "block text-sm font-medium text-slate-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function UserForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save User",
  isEdit = false,
}: UserFormProps) {
  const { data: roles } = useRoles();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserCreateInput>({ defaultValues });

  const selectedRoleId = useWatch({ control, name: "roleId" });
  const selectedRole = roles?.find((r) => r.id === selectedRoleId);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClass}>First Name</label>
        <input className={inputClass} {...register("firstName", { required: "First name is required" })} />
        {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Last Name</label>
        <input className={inputClass} {...register("lastName", { required: "Last name is required" })} />
        {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          className={inputClass}
          disabled={isEdit}
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>
      {!isEdit && (
        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            className={inputClass}
            {...register("password", { required: "Password is required", minLength: 8 })}
          />
          {errors.password && <p className={errorClass}>Password must be at least 8 characters</p>}
        </div>
      )}
      <div>
        <label className={labelClass}>Phone</label>
        <input className={inputClass} {...register("phone")} />
      </div>
      <div>
        <label className={labelClass}>Role</label>
        <select className={inputClass} {...register("roleId", { required: "Role is required" })}>
          <option value="">Select a role...</option>
          {roles?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {errors.roleId && <p className={errorClass}>{errors.roleId.message}</p>}
      </div>
      {isEdit && (
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} {...register("status")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      )}
      {!isEdit && selectedRole?.key === "STUDENT" && (
        <div>
          <label className={labelClass}>Roll Number</label>
          <input
            className={inputClass}
            placeholder="Links this login to an existing student record"
            {...register("rollNumber")}
          />
        </div>
      )}
      {!isEdit && selectedRole?.key === "TEACHER" && (
        <div>
          <label className={labelClass}>Employee ID</label>
          <input
            className={inputClass}
            placeholder="Links this login to an existing teacher record"
            {...register("employeeId")}
          />
        </div>
      )}
      <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 sm:w-auto sm:py-2"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
