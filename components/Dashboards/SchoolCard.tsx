import { useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { useMySchool } from "@/hooks/useSchool";

const PLAN_LABELS: Record<string, string> = { TRIAL: "Free trial", STARTER: "Starter", PRO: "Pro" };

// Shows the admin their school's plan and the school code that students,
// teachers and parents need in order to self-register.
export default function SchoolCard() {
  const { data: school } = useMySchool();
  const [copied, setCopied] = useState(false);
  if (!school) return null;

  const daysLeft =
    school.plan === "TRIAL" && school.trialEndsAt
      ? Math.max(0, differenceInCalendarDays(new Date(school.trialEndsAt), new Date()))
      : null;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/auth/register?school=${school.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. insecure origin); the code is still visible.
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-slate-900">{school.name}</p>
        <p className="mt-0.5 text-sm text-slate-500">
          {PLAN_LABELS[school.plan] ?? school.plan}
          {daysLeft !== null && ` · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">School code</span>
        <code className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-800">{school.slug}</code>
        <button
          type="button"
          onClick={copyInvite}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {copied ? "Copied!" : "Copy invite link"}
        </button>
      </div>
    </div>
  );
}
