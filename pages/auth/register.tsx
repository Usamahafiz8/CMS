import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { registerSchema } from "@/lib/validators";
import { useRegister, type RegisterInput } from "@/hooks/useAuth";
import { ApiClientError } from "@/lib/api-client";
import { homeRouteForRole } from "@/lib/roles";

const ROLES: RegisterInput["role"][] = ["ADMIN", "TEACHER", "STUDENT", "PARENT"];

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useRegister();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({ defaultValues: { role: "STUDENT" } });

  const selectedRole = useWatch({ control, name: "role" });

  const submit = handleSubmit((values) => {
    setServerError(null);
    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      (Object.keys(fieldErrors) as (keyof RegisterInput)[]).forEach((field) => {
        const message = fieldErrors[field]?.[0];
        if (message) setError(field, { message });
      });
      return;
    }

    registerUser.mutate(values, {
      onSuccess: (user) => router.push(homeRouteForRole(user.role)),
      onError: (error) => {
        setServerError(error instanceof ApiClientError ? error.message : "Failed to register");
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
        <h1 className="font-display mb-6 text-center text-2xl font-bold text-slate-900">Create an account</h1>

        {serverError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">First Name</label>
              <input
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                {...register("firstName")}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last Name</label>
              <input
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                {...register("lastName")}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              {...register("role")}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          {selectedRole === "STUDENT" && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Roll Number</label>
              <input
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Given to you by your school admin"
                {...register("rollNumber")}
              />
              {errors.rollNumber && <p className="mt-1 text-xs text-red-600">{errors.rollNumber.message}</p>}
            </div>
          )}
          {selectedRole === "TEACHER" && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Employee ID</label>
              <input
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Given to you by your school admin"
                {...register("employeeId")}
              />
              {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId.message}</p>}
            </div>
          )}
          <button
            type="submit"
            disabled={registerUser.isPending}
            className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {registerUser.isPending ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-brand-600 hover:text-brand-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
