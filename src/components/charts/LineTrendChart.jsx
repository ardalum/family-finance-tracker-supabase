import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../lib/formatters.js";

export default function LineTrendChart({
  data = [],
  lineKey = "value",
  lineName = "Amount",
  xKey = "label",
  emptyMessage = "No trend data available.",
}) {
  if (!data.length) {
    return <p className="text-sm text-text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#6B7280" }} />
          <YAxis tickFormatter={(value) => formatCurrency(Number(value || 0))} hide />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value || 0)), lineName]}
            contentStyle={{ borderRadius: 10, borderColor: "#E5E7EB" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#6B7280" }} />
          <Line
            type="monotone"
            dataKey={lineKey}
            name={lineName}
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
