import BarChart from "@/components/Charts/BarChart";

interface PerformanceChartProps {
  data: { subjectName: string; avgPercentage: number }[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <BarChart
      data={data.map((d) => ({ label: d.subjectName, value: d.avgPercentage }))}
      color="#c1272d"
      valueSuffix="%"
    />
  );
}
