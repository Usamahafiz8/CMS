import Link from "next/link";

// A real "forgot password" flow needs an email/SMTP provider, which isn't
// configured for this project yet. Until then, password resets are handled
// by an admin via POST /api/auth/reset-password.
export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="animate-fade-in-up w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="font-display mb-3 text-2xl font-bold text-slate-900">Forgot your password?</h1>
        <p className="text-sm text-slate-600">
          Self-service email reset isn&apos;t set up yet. Please contact your school administrator — they
          can reset your password from the admin panel.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block font-medium text-brand-600 hover:text-brand-800"
        >
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
