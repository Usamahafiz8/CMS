import { useForm } from "react-hook-form";
import { feeStructureCreateSchema } from "@/lib/validators";
import type { FeeStructureInput } from "@/hooks/useFees";

interface FeeStructureFormProps {
  onSubmit: (values: FeeStructureInput) => void;
  isSubmitting?: boolean;
}

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const labelClass = "block text-sm font-medium text-slate-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function FeeStructureForm({ onSubmit, isSubmitting = false }: FeeStructureFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FeeStructureInput>();

  const submit = handleSubmit((values) => {
    const result = feeStructureCreateSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      (Object.keys(fieldErrors) as (keyof FeeStructureInput)[]).forEach((field) => {
        const message = fieldErrors[field]?.[0];
        if (message) setError(field, { message });
      });
      return;
    }
    onSubmit(values);
  });

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={labelClass}>Name</label>
        <input className={inputClass} placeholder="Tuition Fee - Term 1" {...register("name")} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Fee Type</label>
        <input className={inputClass} placeholder="Tuition" {...register("feeType")} />
        {errors.feeType && <p className={errorClass}>{errors.feeType.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Amount (₹)</label>
        <input type="number" min={0} step="0.01" className={inputClass} {...register("amount")} />
        {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Academic Year</label>
        <input className={inputClass} placeholder="2024-2025" {...register("academicYear")} />
        {errors.academicYear && <p className={errorClass}>{errors.academicYear.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Due Date</label>
        <input type="date" className={inputClass} {...register("dueDate")} />
        {errors.dueDate && <p className={errorClass}>{errors.dueDate.message}</p>}
      </div>
      <div className="sm:col-span-2 flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Create Fee Structure"}
        </button>
      </div>
    </form>
  );
}
