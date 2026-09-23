import Link from "next/link";
import { useRouter } from "next/router";
import NavIcon from "@/components/Common/NavIcons";

interface BottomTabBarProps {
  items: { label: string; href: string }[];
  homeHref: string;
  onMoreClick: () => void;
  isMoreOpen?: boolean;
}

export default function BottomTabBar({ items, homeHref, onMoreClick, isMoreOpen = false }: BottomTabBarProps) {
  const router = useRouter();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const isActive = item.href === homeHref ? router.pathname === item.href : router.pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors ${
              isActive ? "text-brand-600" : "text-slate-500"
            }`}
          >
            <NavIcon label={item.label} className="h-5 w-5" />
            <span className="truncate px-0.5">{item.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onMoreClick}
        className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors ${
          isMoreOpen ? "text-brand-600" : "text-slate-500"
        }`}
      >
        <NavIcon label="More" className="h-5 w-5" />
        <span>More</span>
      </button>
    </nav>
  );
}
