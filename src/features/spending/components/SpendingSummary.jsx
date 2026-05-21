import { CircleDollarSign, FileText, Info, ShoppingBasket, TrendingDown } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getTotalSpending, summarizeByCategory } from "../spendingService.js";

export default function SpendingSummary({ transactions, categories }) {
  const totalSpent = getTotalSpending(transactions);
  const transactionCount = transactions.length;
  const topCategory = summarizeByCategory(transactions, categories)[0] ?? null;
  const largestTransaction = transactions.reduce(
    (largest, transaction) =>
      Number(transaction.amount || 0) > largest ? Number(transaction.amount || 0) : largest,
    0,
  );

  const cards = [
    {
      title: "Total spent this month",
      value: formatCurrency(totalSpent),
      helper: "Based on current month transactions",
      icon: TrendingDown,
      iconWrapClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    {
      title: "Transaction count",
      value: `${transactionCount}`,
      helper: `${transactionCount} recorded item${transactionCount === 1 ? "" : "s"}`,
      icon: FileText,
      iconWrapClass: "bg-blue-50 text-blue-700 ring-blue-100",
    },
    {
      title: "Top category",
      value: topCategory ? topCategory.name : "No category yet",
      helper: topCategory ? formatCurrency(topCategory.amount) : "No spending data yet",
      icon: ShoppingBasket,
      iconWrapClass: "bg-amber-50 text-amber-700 ring-amber-100",
      wrapValue: true,
    },
    {
      title: "Largest transaction",
      value: formatCurrency(largestTransaction),
      helper: "Highest single amount",
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
    <Card className="grid min-h-[140px] gap-4 rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted">
          <span>{title}</span>
          <Info size={14} aria-hidden="true" />
        </div>
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${iconWrapClass}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p
        className={`text-2xl font-semibold tracking-tight text-text-main sm:text-[1.9rem] ${wrapValue ? "line-clamp-2 text-[1.45rem] leading-snug sm:text-[1.55rem]" : ""}`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      <p className="text-sm text-text-soft">{helper}</p>
    </Card>
  );
}
