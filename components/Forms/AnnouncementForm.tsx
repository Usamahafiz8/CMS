import { useForm } from "react-hook-form";
import { announcementCreateSchema } from "@/lib/validators";

export interface AnnouncementInput {
  title: string;
  content: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  targetRole?: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
}

interface AnnouncementFormProps {
  onSubmit: (values: AnnouncementInput) => void;
  isSubmitting?: boolean;
}

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const labelClass = "block text-sm font-medium text-slate-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function AnnouncementForm({ onSubmit, isSubmitting = false }: AnnouncementFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AnnouncementInput>({ defaultValues: { priority: "MEDIUM" } });

  const submit = handleSubmit((values) => {
    const result = announcementCreateSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      (Object.keys(fieldErrors) as (keyof AnnouncementInput)[]).forEach((field) => {
        const message = fieldErrors[field]?.[0];
        if (message) setError(field, { message });
      });
      return;
    }
    onSubmit(values);
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Title</label>
        <input className={inputClass} {...register("title")} />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Content</label>
        <textarea rows={4} className={inputClass} {...register("content")} />
        {errors.content && <p className={errorClass}>{errors.content.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Priority</label>
          <select className={inputClass} {...register("priority")}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Visible to</label>
          <select className={inputClass} {...register("targetRole")}>
            <option value="">Everyone</option>
            <option value="ADMIN">Admins</option>
            <option value="TEACHER">Teachers</option>
            <option value="STUDENT">Students</option>
            <option value="PARENT">Parents</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Posting..." : "Post Announcement"}
        </button>
      </div>
    </form>
  );
}
