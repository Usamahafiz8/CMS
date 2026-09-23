import { useState } from "react";
import { useForm } from "react-hook-form";
import { examCreateSchema } from "@/lib/validators";
import type { ExamInput } from "@/hooks/useExam";
import type { Class, Subject } from "@/generated/prisma/client";

interface ExamFormProps {
  classes: Class[];
  subjects: Subject[];
  onSubmit: (values: ExamInput) => void;
  isSubmitting?: boolean;
}

const EXAM_TYPES: ExamInput["type"][] = ["UNIT_TEST", "MIDTERM", "QUARTERLY", "FINAL", "MOCK"];

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:py-2 sm:text-sm";
const labelClass = "block text-sm font-medium text-slate-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function ExamForm({ classes, subjects, onSubmit, isSubmitting = false }: ExamFormProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Omit<ExamInput, "subjectIds">>({ defaultValues: { type: "UNIT_TEST" } });

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const submit = handleSubmit((values) => {
    setSubjectError(null);
    const candidate = { ...values, subjectIds: selectedSubjects };
    const result = examCreateSchema.safeParse(candidate);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      (Object.keys(fieldErrors) as (keyof typeof candidate)[]).forEach((field) => {
        const message = fieldErrors[field]?.[0];
        if (!message) return;
        if (field === "subjectIds") setSubjectError(message);
        else setError(field as keyof Omit<ExamInput, "subjectIds">, { message });
      });
      return;
    }
    onSubmit(candidate);
  });

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClass}>Exam Name</label>
        <input className={inputClass} placeholder="Midterm Exam" {...register("name")} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Type</label>
        <select className={inputClass} {...register("type")}>
          {EXAM_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Class</label>
        <select className={inputClass} {...register("classId")}>
          <option value="">Select a class...</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} - {c.section}
            </option>
          ))}
        </select>
        {errors.classId && <p className={errorClass}>{errors.classId.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Start Date</label>
        <input type="date" className={inputClass} {...register("startDate")} />
        {errors.startDate && <p className={errorClass}>{errors.startDate.message}</p>}
      </div>
      <div>
        <label className={labelClass}>End Date</label>
        <input type="date" className={inputClass} {...register("endDate")} />
        {errors.endDate && <p className={errorClass}>{errors.endDate.message}</p>}
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Subjects</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => toggleSubject(subject.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                selectedSubjects.includes(subject.id)
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>
        {subjectError && <p className={errorClass}>{subjectError}</p>}
      </div>
      <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 sm:w-auto sm:py-2"
        >
          {isSubmitting ? "Saving..." : "Create Exam"}
        </button>
      </div>
    </form>
  );
}
