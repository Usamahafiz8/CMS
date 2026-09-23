import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/Common/Navbar";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import NavIcon from "@/components/Common/NavIcons";
import BottomTabBar from "@/components/Common/BottomTabBar";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Checking your session..." />
      </div>
    );
  }

  const homeHref = navItems[0]?.href ?? "/";
  const tabItems = navItems.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <div className="flex flex-1">
        {isMenuOpen && (
          <div
            aria-hidden
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        )}
        <aside
          className={`fixed inset-x-0 bottom-0 z-40 max-h-[75vh] w-full transform overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out md:static md:inset-auto md:z-auto md:h-auto md:max-h-none md:w-60 md:shrink-0 md:translate-y-0 md:transform-none md:overflow-y-auto md:rounded-none md:border-t-0 md:border-r md:shadow-none ${
            isMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex justify-center pt-2.5 pb-1 md:hidden">
            <span className="h-1.5 w-10 rounded-full bg-slate-200" />
          </div>
          <nav className="flex flex-col gap-0.5 p-4">
            {navItems.map((item) => {
              const isActive =
                item.href === homeHref
                  ? router.pathname === item.href
                  : router.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors md:py-2 ${
                    isActive
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <NavIcon label={item.label} className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-4 pb-24 sm:p-6 md:p-8 md:pb-8">
          <h1 className="font-display mb-4 text-xl font-bold text-slate-900 sm:mb-6 sm:text-2xl">{title}</h1>
          <div className="animate-fade-in-up">{children}</div>
        </main>
      </div>
      <BottomTabBar items={tabItems} homeHref={homeHref} onMoreClick={() => setIsMenuOpen(true)} isMoreOpen={isMenuOpen} />
    </div>
  );
}
