import Link from "next/link";
import { useRouter } from "next/router";
import { useLogout } from "@/hooks/useAuth";
import type { SafeUser } from "@/hooks/useAuth";
import InstallPWAButton from "@/components/Common/InstallPWAButton";
import { homeRouteForRole } from "@/lib/roles";

interface NavbarProps {
  user: SafeUser;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const logout = useLogout();
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:h-16 sm:px-6">
      <Link href={homeRouteForRole(user.role.key)} className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          S
        </span>
        <span className="font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          SchoolHub
        </span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <InstallPWAButton />
        </div>
        <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 sm:inline">
          {user.role.name}
        </span>
        <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            {initials}
          </span>
          <span className="text-sm text-slate-600">
            {user.firstName} {user.lastName}
          </span>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 sm:hidden">
          {initials}
        </span>
        <button
          type="button"
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.replace("/auth/login") })}
          aria-label="Logout"
          className="flex h-9 items-center rounded-md border border-slate-300 px-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:h-auto sm:px-3 sm:py-1.5"
        >
          <span className="sm:hidden">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4.5 w-4.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 5v1a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>
          </span>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
