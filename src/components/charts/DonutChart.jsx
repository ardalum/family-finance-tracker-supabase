import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../../lib/formatters.js";

const DEFAULT_COLORS = [
  "#2563EB",
  "#14B8A6",
  "#F97316",
  "#A855F7",
  "#EC4899",
  "#22C55E",
  "#06B6D4",
  "#F59E0B",
];

export default function DonutChart({
  data = [],
  emptyMessage = "No chart data available.",
  valueLabel = "Amount",
}) {
  if (!data.length) {
    return <p className="text-sm text-text-muted">{emptyMessage}</p>;
  }

  const normalized = data
    .map((row, index) => ({
      name: row.label,
      value: Number(row.value || 0),
      color: row.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }))
    .filter((row) => row.value > 0);

  if (!normalized.length) {
    return <p className="text-sm text-text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={normalized}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={90}
            paddingAngle={2}
          >
            {normalized.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value || 0)), valueLabel]}
            contentStyle={{ borderRadius: 10, borderColor: "#E5E7EB" }}
          />
          <Legend
            verticalAlign="bottom"
            height={46}
            wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
