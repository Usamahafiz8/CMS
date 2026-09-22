import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string | number;
  href?: string;
}

export default function StatCard({ label, value, href }: StatCardProps) {
  const content = (
    <div className="cms-card-hover rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="font-display mt-2 truncate text-3xl font-bold text-slate-900" title={String(value)}>
        {value}
      </p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
