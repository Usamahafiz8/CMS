import { useForm } from "react-hook-form";

interface ResetPasswordFormProps {
  onSubmit: (newPassword: string) => void;
  isSubmitting?: boolean;
}

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:py-2 sm:text-sm";
const labelClass = "block text-sm font-medium text-slate-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function ResetPasswordForm({ onSubmit, isSubmitting = false }: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ newPassword: string }>();

  const submit = handleSubmit((values) => onSubmit(values.newPassword));

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:gap-4">
      <div>
        <label className={labelClass}>New Password</label>
        <input
          type="password"
          className={inputClass}
          {...register("newPassword", { required: "New password is required", minLength: 8 })}
        />
        {errors.newPassword && <p className={errorClass}>Password must be at least 8 characters</p>}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 sm:w-auto sm:py-2"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </form>
  );
}
