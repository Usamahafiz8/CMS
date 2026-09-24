import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Common/Navbar";
import Sidebar from "@/components/Common/Sidebar";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isAdminPortalRole } from "@/lib/roles";

interface AdminLayoutProps {
  title: string;
  children: ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const router = useRouter();
  // No fixed role list here: ADMIN, SUPER_ADMIN, and any custom (staff)
  // role all use this portal — access to individual pages/actions within it
  // is controlled by permission, not by which role the account holds.
  const { user, isAuthorized: hasSession } = useRequireAuth();
  const isAuthorized = hasSession && !!user && isAdminPortalRole(user.role.key);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (hasSession && user && !isAdminPortalRole(user.role.key)) {
      router.replace("/auth/login");
    }
  }, [hasSession, user, router]);

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
        <Sidebar
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onOpenMore={() => setIsMenuOpen(true)}
        />
        <main className="flex-1 p-4 pb-24 sm:p-6 md:pb-6">
          <h1 className="font-display mb-4 text-xl font-bold text-slate-900 sm:mb-5 sm:text-2xl">{title}</h1>
          <div className="animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
