import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { schoolSignupSchema } from "@/lib/validators";
import { useSchoolSignup, type SchoolSignupInput } from "@/hooks/useAuth";
import { ApiClientError } from "@/lib/api-client";
import { TRIAL_DAYS } from "@/lib/constants";

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:py-2 sm:text-sm";

export default function SchoolSignupPage() {
  const router = useRouter();
  const signup = useSchoolSignup();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SchoolSignupInput>();

  const submit = handleSubmit((values) => {
    setServerError(null);
    const result = schoolSignupSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      (Object.keys(fieldErrors) as (keyof SchoolSignupInput)[]).forEach((field) => {
        const message = fieldErrors[field]?.[0];
        if (message) setError(field, { message });
      });
      return;
    }

    signup.mutate(values, {
      onSuccess: () => router.push("/admin"),
      onError: (error) => {
        setServerError(error instanceof ApiClientError ? error.message : "Failed to create your school");
      },
    });
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-105 w-180 -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-600/10 blur-3xl"
      />
      <div className="animate-fade-in-up relative w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-center text-2xl font-bold text-slate-900">Start your free trial</h1>
        <p className="mb-6 mt-2 text-center text-sm text-slate-500">
          {TRIAL_DAYS} days free. No credit card needed.
        </p>

        {serverError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">School Name</label>
            <input className={inputClass} placeholder="e.g. Greenfield Public School" {...register("schoolName")} />
            {errors.schoolName && <p className="mt-1 text-xs text-red-600">{errors.schoolName.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">First Name</label>
              <input className={inputClass} {...register("firstName")} />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last Name</label>
              <input className={inputClass} {...register("lastName")} />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Work Email</label>
            <input type="email" className={inputClass} {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" className={inputClass} {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={signup.isPending}
            className="mt-2 w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 sm:py-2"
          >
            {signup.isPending ? "Setting up your school..." : "Create my school"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already using SchoolHub?{" "}
          <Link href="/auth/login" className="font-medium text-brand-600 hover:text-brand-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
