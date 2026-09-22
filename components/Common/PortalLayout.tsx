import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/Common/Navbar";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface PortalLayoutProps {
  title: string;
  role: string;
  navItems: { label: string; href: string }[];
  children: ReactNode;
}

export default function PortalLayout({ title, role, navItems, children }: PortalLayoutProps) {
  const { user, isAuthorized } = useRequireAuth([role]);
  const router = useRouter();

  if (!isAuthorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Checking your session..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
          <nav className="flex flex-col gap-0.5 p-4">
            {navItems.map((item) => {
              const isActive =
                item.href === navItems[0].href
                  ? router.pathname === item.href
                  : router.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-8">
          <h1 className="font-display mb-6 text-2xl font-bold text-slate-900">{title}</h1>
          <div className="animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
