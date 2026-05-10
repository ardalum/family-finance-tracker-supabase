import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const colors = ["#0f766e", "#2563eb", "#16a34a", "#f59e0b", "#e11d48", "#8b5cf6", "#0891b2", "#64748b"];

export default function DashboardCharts({ chartData }) {
  const spendingByCategory = withPercentages(chartData.spendingByCategory);

  return (
    <section className="grid gap-6 xl:grid-cols-3">
      <ChartCard title="Spending by Category">
        {spendingByCategory.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={spendingByCategory}
                dataKey="value"
                nameKey="label"
                outerRadius={88}
                labelLine={false}
              >
                {spendingByCategory.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, lineHeight: "18px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Budget vs Spending">
        {chartData.budgetVsSpending.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData.budgetVsSpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="budget" fill="#9ca3af" />
              <Bar dataKey="spent" fill="#0f766e" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Monthly Spending Trend">
        {chartData.monthlyTrend.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="total" stroke="#0f766e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </section>
  );
}

function withPercentages(items) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  if (total <= 0) return items;

  return items.map((item) => ({
    ...item,
    label: `${item.name} ${(Number(item.value || 0) / total * 100).toFixed(0)}%`,
  }));
}


function ChartCard({ title, children }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500">
      No data for this chart yet.
    </div>
  );
}
