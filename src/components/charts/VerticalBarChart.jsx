import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../../lib/formatters.js";

export default function VerticalBarChart({
  data = [],
  dataKey = "value",
  dataName = "Amount",
  xKey = "label",
  emptyMessage = "No chart data available.",
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
            formatter={(value) => [formatCurrency(Number(value || 0)), dataName]}
            contentStyle={{ borderRadius: 10, borderColor: "#E5E7EB" }}
          />
          <Bar dataKey={dataKey} name={dataName} fill="#0EA5E9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
