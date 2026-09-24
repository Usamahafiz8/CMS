import { useForm } from "react-hook-form";
import { teacherCreateSchema } from "@/lib/validators";
import type { TeacherInput } from "@/hooks/useTeacher";

interface TeacherFormProps {
  defaultValues?: Partial<TeacherInput>;
  onSubmit: (values: TeacherInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:py-2 sm:text-sm";
const labelClass = "block text-sm font-medium text-slate-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function TeacherForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Teacher",
}: TeacherFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TeacherInput>({ defaultValues });

  const submit = handleSubmit((values) => {
    const result = teacherCreateSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      (Object.keys(fieldErrors) as (keyof TeacherInput)[]).forEach((field) => {
        const message = fieldErrors[field]?.[0];
        if (message) setError(field, { message });
      });
      return;
    }
    onSubmit(values);
  });

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className={labelClass}>First Name</label>
        <input className={inputClass} {...register("firstName")} />
        {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Last Name</label>
        <input className={inputClass} {...register("lastName")} />
        {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Employee ID</label>
        <input className={inputClass} {...register("employeeId")} />
        {errors.employeeId && <p className={errorClass}>{errors.employeeId.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input className={inputClass} {...register("phone")} />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input type="email" className={inputClass} {...register("email")} />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Experience (years)</label>
        <input type="number" min={0} className={inputClass} {...register("experience")} />
        {errors.experience && <p className={errorClass}>{errors.experience.message}</p>}
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className={labelClass}>Qualifications</label>
        <input className={inputClass} {...register("qualifications")} />
        {errors.qualifications && <p className={errorClass}>{errors.qualifications.message}</p>}
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className={labelClass}>Address</label>
        <input className={inputClass} {...register("address")} />
        {errors.address && <p className={errorClass}>{errors.address.message}</p>}
      </div>
      <div className="sm:col-span-2 flex justify-end gap-3 pt-2 lg:col-span-3">
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
