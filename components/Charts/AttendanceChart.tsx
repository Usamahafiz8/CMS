import BarChart from "@/components/Charts/BarChart";

interface AttendanceChartProps {
  data: { className: string; attendancePercentage: number }[];
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <BarChart
      data={data.map((d) => ({ label: d.className, value: d.attendancePercentage }))}
      color="#16a34a"
      valueSuffix="%"
    />
  );
}
