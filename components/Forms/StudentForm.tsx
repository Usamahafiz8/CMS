import { useForm } from "react-hook-form";
import { studentCreateSchema } from "@/lib/validators";
import type { StudentInput } from "@/hooks/useStudent";

interface StudentFormProps {
  defaultValues?: Partial<StudentInput>;
  onSubmit: (values: StudentInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const labelClass = "block text-sm font-medium text-slate-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function StudentForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Student",
}: StudentFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<StudentInput>({ defaultValues });

  const submit = handleSubmit((values) => {
    const result = studentCreateSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      (Object.keys(fieldErrors) as (keyof StudentInput)[]).forEach((field) => {
        const message = fieldErrors[field]?.[0];
        if (message) setError(field, { message });
      });
      return;
    }
    onSubmit(values);
  });

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <label className={labelClass}>Roll Number</label>
        <input className={inputClass} {...register("rollNumber")} />
        {errors.rollNumber && <p className={errorClass}>{errors.rollNumber.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Date of Birth</label>
        <input type="date" className={inputClass} {...register("dateOfBirth")} />
        {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth.message}</p>}
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
        <label className={labelClass}>Guardian Name</label>
        <input className={inputClass} {...register("guardianName")} />
        {errors.guardianName && <p className={errorClass}>{errors.guardianName.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Guardian Phone</label>
        <input className={inputClass} {...register("guardianPhone")} />
        {errors.guardianPhone && <p className={errorClass}>{errors.guardianPhone.message}</p>}
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Address</label>
        <input className={inputClass} {...register("address")} />
        {errors.address && <p className={errorClass}>{errors.address.message}</p>}
      </div>
      <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
