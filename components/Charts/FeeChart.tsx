import BarChart from "@/components/Charts/BarChart";

interface FeeChartProps {
  data: { feeType: string; collected: number; outstanding: number }[];
}

export default function FeeChart({ data }: FeeChartProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">Collected</p>
        <BarChart data={data.map((d) => ({ label: d.feeType, value: d.collected }))} color="#16a34a" />
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">Outstanding</p>
        <BarChart data={data.map((d) => ({ label: d.feeType, value: d.outstanding }))} color="#dc2626" />
      </div>
    </div>
  );
}
