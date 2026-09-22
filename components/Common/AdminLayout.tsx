import type { ReactNode } from "react";
import Navbar from "@/components/Common/Navbar";
import Sidebar from "@/components/Common/Sidebar";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface AdminLayoutProps {
  title: string;
  children: ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const { user, isAuthorized } = useRequireAuth(["ADMIN"]);

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
        <Sidebar />
        <main className="flex-1 p-4 md:p-8">
          <h1 className="font-display mb-6 text-2xl font-bold text-slate-900">{title}</h1>
          <div className="animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
