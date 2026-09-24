import { useId } from "react";

// Chalkora brand mark: a chalk-stroke "C" opening onto a spark — the
// "aurora" of a new idea. Kept in sync with public/logo.svg (favicon/PWA icons).
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  // Unique gradient id so several marks on one page don't collide.
  const gradientId = `chalkora-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8434b" />
          <stop offset="1" stopColor="#a01e24" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
      <path
        d="M42.6 20.4 A16 16 0 1 0 42.6 43.6"
        fill="none"
        stroke="#fff"
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      <path
        d="M47 23.5 C47.7 29.2 48.8 30.3 54.5 31 C48.8 31.7 47.7 32.8 47 38.5 C46.3 32.8 45.2 31.7 39.5 31 C45.2 30.3 46.3 29.2 47 23.5Z"
        fill="#fde68a"
      />
    </svg>
  );
}

// Mark + wordmark. `size` scales both together.
export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const styles = {
    sm: { mark: "h-7 w-7", text: "text-base" },
    md: { mark: "h-8 w-8", text: "text-lg" },
    lg: { mark: "h-11 w-11", text: "text-2xl" },
  }[size];
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className={`${styles.mark} shrink-0`} />
      <span className={`font-display font-bold tracking-tight text-slate-900 ${styles.text}`}>
        Chalk<span className="text-brand-600">ora</span>
      </span>
    </span>
  );
}
