import { useForm } from "react-hook-form";
import { subjectCreateSchema } from "@/lib/validators";
import type { SubjectInput } from "@/hooks/useSubject";

interface SubjectFormProps {
  defaultValues?: Partial<SubjectInput>;
  onSubmit: (values: SubjectInput) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:py-2 sm:text-sm";
const labelClass = "block text-sm font-medium text-slate-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function SubjectForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Subject",
}: SubjectFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SubjectInput>({ defaultValues });

  const submit = handleSubmit((values) => {
    const result = subjectCreateSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      (Object.keys(fieldErrors) as (keyof SubjectInput)[]).forEach((field) => {
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
        <label className={labelClass}>Subject Name</label>
        <input className={inputClass} placeholder="Mathematics" {...register("name")} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Subject Code</label>
        <input className={inputClass} placeholder="MATH101" {...register("code")} />
        {errors.code && <p className={errorClass}>{errors.code.message}</p>}
      </div>
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
