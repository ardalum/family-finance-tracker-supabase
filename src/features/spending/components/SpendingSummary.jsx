import { CircleDollarSign, FileText, Info, ShoppingBasket, TrendingDown } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { getTotalSpending, summarizeByCategory } from "../spendingService.js";

export default function SpendingSummary({ transactions, categories, previousMonthHint = null }) {
  const totalSpent = getTotalSpending(transactions);
  const transactionCount = transactions.length;
  const topCategory = summarizeByCategory(transactions, categories)[0] ?? null;
  const largestTransactionEntry = transactions.reduce((largest, transaction) => {
    const value = Number(transaction.amount || 0);
    if (!largest || value > Number(largest.amount || 0)) return transaction;
    return largest;
  }, null);
  const largestTransactionAmount = Number(largestTransactionEntry?.amount || 0);
  const topCategoryPercent =
    totalSpent > 0 && topCategory ? Math.round((topCategory.amount / totalSpent) * 100) : 0;
  const spentComparison = previousMonthHint
    ? buildComparisonHelper(totalSpent, previousMonthHint.totalSpent, previousMonthHint.monthKey)
    : "Based on current month transactions";
  const txCountHelper = previousMonthHint
    ? buildCountComparison(
        transactionCount,
        previousMonthHint.transactionCount,
        previousMonthHint.monthKey,
      )
    : `${transactionCount} recorded item${transactionCount === 1 ? "" : "s"}`;

  const cards = [
    {
      title: "Total spent this month",
      value: formatCurrency(totalSpent),
      helper: spentComparison,
      icon: TrendingDown,
      iconWrapClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    {
      title: "Transaction count",
      value: `${transactionCount}`,
      helper: txCountHelper,
      icon: FileText,
      iconWrapClass: "bg-blue-50 text-blue-700 ring-blue-100",
    },
    {
      title: "Top category",
      value: topCategory ? topCategory.name : "No category yet",
      helper: topCategory
        ? `${formatCurrency(topCategory.amount)} · ${topCategoryPercent}% of total`
        : "No spending data yet",
      icon: ShoppingBasket,
      iconWrapClass: "bg-amber-50 text-amber-700 ring-amber-100",
      wrapValue: true,
    },
    {
      title: "Largest transaction",
      value: formatCurrency(largestTransactionAmount),
      helper: largestTransactionEntry?.merchant || "No transaction yet.",
      icon: CircleDollarSign,
      iconWrapClass: "bg-teal-50 text-teal-700 ring-teal-100",
    },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.title} {...card} />
      ))}
    </section>
  );
}

function SummaryCard({ title, value, helper, icon: Icon, iconWrapClass, wrapValue = false }) {
  return (
    <Card className="min-h-[108px] rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <span>{title}</span>
            <Info size={13} aria-hidden="true" />
          </div>
          <p
            className={`mt-1 truncate font-semibold tracking-tight text-text-main ${
              wrapValue
                ? "line-clamp-2 text-[1.25rem] leading-snug sm:text-[1.35rem]"
                : "text-2xl sm:text-[1.65rem]"
            }`}
            style={{ fontVariantNumeric: "tabular-nums" }}
            title={value}
          >
            {value}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-soft" title={helper}>
            {helper}
          </p>
        </div>
        <span
          className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${iconWrapClass}`}
        >
          <Icon size={24} aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}

function buildComparisonHelper(current, previous, monthKey) {
  const prev = Number(previous || 0);
  if (prev <= 0) return "Based on current month transactions";
  const deltaPct = ((current - prev) / prev) * 100;
  const direction = deltaPct <= 0 ? "down" : "up";
  const signed = `${deltaPct > 0 ? "+" : ""}${Math.abs(deltaPct).toFixed(1)}%`;
  return `${direction} ${signed} vs ${formatMonthLabel(monthKey)}`;
}

function buildCountComparison(current, previous, monthKey) {
  const prev = Number(previous || 0);
  if (prev < 0) return `${current} recorded items`;
  const delta = current - prev;
  const direction = delta >= 0 ? "+" : "";
  return `${direction}${delta} vs ${formatMonthLabel(monthKey)} (${prev})`;
}
