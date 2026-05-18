import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../lib/formatters.js";

export default function StackedBarChart({
  data = [],
  xKey = "label",
  stackAKey = "budget",
  stackAName = "Budget",
  stackBKey = "spent",
  stackBName = "Spent",
  emptyMessage = "No comparison data available.",
}) {
  if (!data.length) {
    return <p className="text-sm text-text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#6B7280" }} />
          <YAxis tickFormatter={(value) => formatCurrency(Number(value || 0))} hide />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value || 0))]}
            contentStyle={{ borderRadius: 10, borderColor: "#E5E7EB" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#6B7280" }} />
          <Bar
            dataKey={stackAKey}
            name={stackAName}
            stackId="budget-vs-spent"
            fill="#A7F3D0"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey={stackBKey}
            name={stackBName}
            stackId="budget-vs-spent"
            fill="#2563EB"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
