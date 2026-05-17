import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatMonthLabel } from "../../../lib/formatters.js";

const statusStyles = {
  complete: "bg-status-successBg text-status-successDark",
  "needs-review": "bg-status-dangerBg text-status-danger",
  warning: "bg-status-warningBg text-status-warningDark",
  recommended: "bg-app-background text-text-muted",
};

const statusLabels = {
  complete: "Complete",
  "needs-review": "Needs review",
  warning: "Warning",
  recommended: "Recommended",
};

export default function MonthlyCloseChecklist({ monthKey, checklist, onNavigate }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h3 className="text-base font-semibold text-text-main">Monthly close checklist</h3>
        <p className="mt-1 text-sm text-text-muted">
          {formatMonthLabel(monthKey)}: {checklist.completedCount} of {checklist.totalCount} checks
          complete.
        </p>
      </div>
      <div className="grid gap-2 p-4">
        {checklist.items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 rounded-xl border border-app-border bg-app-background p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-text-main">{item.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[item.status]}`}
                >
                  {statusLabels[item.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-muted">{item.description}</p>
            </div>
            <div className="sm:self-center">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => onNavigate(item.view, item.target)}
              >
                Open
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
