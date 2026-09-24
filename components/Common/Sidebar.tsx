import Link from "next/link";
import { useRouter } from "next/router";
import { useCan } from "@/hooks/usePermissions";
import NavIcon from "@/components/Common/NavIcons";
import BottomTabBar from "@/components/Common/BottomTabBar";

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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenMore?: () => void;
}

export default function Sidebar({ isOpen = false, onClose, onOpenMore }: SidebarProps) {
  const router = useRouter();
  const can = useCan();

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((section) => section.items.length > 0);

  const flatItems = visibleSections.flatMap((section) => section.items);
  const tabItems = flatItems.slice(0, 4);

  return (
    <>
      {isOpen && (
        <div aria-hidden onClick={onClose} className="fixed inset-0 z-30 bg-black/40 md:hidden" />
      )}
      <aside
        className={`fixed inset-x-0 bottom-0 z-40 max-h-[75vh] w-full transform overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out md:static md:inset-auto md:z-auto md:h-auto md:max-h-none md:w-60 md:shrink-0 md:translate-y-0 md:transform-none md:overflow-y-auto md:rounded-none md:border-t-0 md:border-r md:shadow-none ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-center pt-2.5 pb-1 md:hidden">
          <span className="h-1.5 w-10 rounded-full bg-slate-200" />
        </div>
        <nav className="flex flex-col gap-6 p-4">
          {visibleSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
              <div className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? router.pathname === item.href
                      : router.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
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
              </div>
            </div>
          ))}
        </nav>
      </aside>
      {onOpenMore && (
        <BottomTabBar items={tabItems} homeHref="/admin" onMoreClick={onOpenMore} isMoreOpen={isOpen} />
      )}
    </>
  );
}
