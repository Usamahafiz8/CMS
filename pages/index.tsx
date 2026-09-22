import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-slate-50 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-105 w-180 -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-600/10 blur-3xl"
      />
      <h1 className="font-display animate-fade-in-up relative text-4xl font-bold text-slate-900">
        SchoolHub CMS
      </h1>
      <p className="animate-fade-in-up relative max-w-md text-slate-600">
        School management system for admins, teachers, students and parents — attendance, marks,
        timetables, fees and more, all in one place.
      </p>
      <div className="flex gap-3">
        <Link
          href="/auth/login"
          className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
