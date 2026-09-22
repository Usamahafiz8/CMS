interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  valueSuffix?: string;
  height?: number;
}

export default function BarChart({ data, color = "#c1272d", valueSuffix = "", height = 200 }: BarChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No data to display.</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-48 w-full">
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height - 20);
          return (
            <rect
              key={d.label}
              x={i * barWidth + barWidth * 0.15}
              y={height - 20 - barHeight}
              width={barWidth * 0.7}
              height={barHeight}
              fill={color}
              rx={1}
            >
              <title>
                {d.label}: {d.value}
                {valueSuffix}
              </title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-2 flex text-[10px] text-slate-500">
        {data.map((d) => (
          <div key={d.label} className="flex-1 truncate text-center" title={d.label}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
