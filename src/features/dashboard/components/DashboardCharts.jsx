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

const colors = ["#10B981", "#4F46E5", "#06B6D4", "#22C55E", "#F97316", "#DC2626", "#1F2937", "#6B7280"];

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
              <Bar dataKey="budget" fill="#4F46E5" />
              <Bar dataKey="spent" fill="#10B981" />
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
              <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} />
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
      <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] text-sm text-[#6B7280]">
      No data for this chart yet.
    </div>
  );
}
