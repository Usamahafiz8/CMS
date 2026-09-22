import BarChart from "@/components/Charts/BarChart";

interface EnrollmentChartProps {
  data: { className: string; enrolled: number }[];
}

export default function EnrollmentChart({ data }: EnrollmentChartProps) {
  return <BarChart data={data.map((d) => ({ label: d.className, value: d.enrolled }))} color="#7c3aed" />;
}
