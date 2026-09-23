import Link from "next/link";
import { useRouter } from "next/router";
import { useLogout } from "@/hooks/useAuth";
import type { SafeUser } from "@/hooks/useAuth";
import InstallPWAButton from "@/components/Common/InstallPWAButton";
import { homeRouteForRole } from "@/lib/roles";

interface NavbarProps {
  user: SafeUser;
  onMenuClick?: () => void;
}

export default function Navbar({ user, onMenuClick }: NavbarProps) {
  const router = useRouter();
  const logout = useLogout();
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle navigation menu"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link href={homeRouteForRole(user.role.key)} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            S
          </span>
          <span className="font-display hidden text-lg font-semibold tracking-tight text-slate-900 sm:inline">
            SchoolHub
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <InstallPWAButton />
        <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 sm:inline">
          {user.role.name}
        </span>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            {initials}
          </span>
          <span className="hidden text-sm text-slate-600 sm:inline">
            {user.firstName} {user.lastName}
          </span>
        </div>
        <button
          type="button"
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.replace("/auth/login") })}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:px-3"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
