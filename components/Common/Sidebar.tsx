import Link from "next/link";
import { useRouter } from "next/router";
import { useCan } from "@/hooks/usePermissions";

interface NavItem {
  label: string;
  href: string;
  permission?: string;
}

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin" }],
  },
  {
    label: "People & Classes",
    items: [
      { label: "Students", href: "/admin/students" },
      { label: "Teachers", href: "/admin/teachers" },
      { label: "Classes", href: "/admin/classes" },
      { label: "Subjects", href: "/admin/subjects" },
    ],
  },
  {
    label: "Academics",
    items: [
      { label: "Attendance", href: "/admin/attendance" },
      { label: "Marks", href: "/admin/academics" },
      { label: "Exams", href: "/admin/exams" },
      { label: "Timetable", href: "/admin/timetable" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Communication", href: "/admin/communication" },
      { label: "Fees", href: "/admin/fees" },
      { label: "Reports", href: "/admin/reports" },
    ],
  },
  {
    label: "Access Control",
    items: [
      { label: "Users", href: "/admin/users", permission: "users.view" },
      { label: "Roles", href: "/admin/roles", permission: "roles.view" },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const can = useCan();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
      <nav className="flex flex-col gap-6 p-4">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => !item.permission || can(item.permission));
          if (items.length === 0) return null;

          return (
            <div key={section.label}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const isActive =
                    item.href === "/admin"
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
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
