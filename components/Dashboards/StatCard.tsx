import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string | number;
  href?: string;
}

export default function StatCard({ label, value, href }: StatCardProps) {
  const text = String(value);
  // Long values (currency amounts, mostly) get a smaller size so the whole
  // number stays on one line. Wrapping a number on to a second line breaks
  // it apart mid-token (e.g. "9,998." / "00"), which reads worse than
  // shrinking the font, so this never wraps — it just scales down.
  const sizeClass =
    text.length > 10 ? "text-lg sm:text-xl" : text.length > 6 ? "text-xl sm:text-2xl lg:text-3xl" : "text-3xl";

  const content = (
    <div className="cms-card-hover flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-lg sm:p-5">
      <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
      <p
        className={`font-display mt-1.5 truncate leading-tight font-bold text-slate-900 ${sizeClass}`}
        title={text}
      >
        {text}
      </p>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}
