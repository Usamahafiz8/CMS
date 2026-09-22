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
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <Link href={homeRouteForRole(user.role)} className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          S
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-slate-900">SchoolHub</span>
      </Link>
      <div className="flex items-center gap-3">
        <InstallPWAButton />
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          {user.role}
        </span>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
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
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
