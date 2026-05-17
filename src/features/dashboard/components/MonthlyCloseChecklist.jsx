import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatMonthLabel } from "../../../lib/formatters.js";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";

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

export default function MonthlyCloseChecklist({
  monthKey,
  checklist,
  onNavigate,
  reviewLoading = false,
  reviewSaving = false,
  reviewError = "",
  onToggleManualCheck,
  onMarkReviewed,
  onReopenReview,
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-text-main">Monthly close checklist</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              checklist.isReviewed
                ? "bg-status-successBg text-status-successDark"
                : "bg-status-warningBg text-status-warningDark"
            }`}
          >
            {checklist.isReviewed ? "Reviewed" : "In progress"}
          </span>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          {formatMonthLabel(monthKey)}: {checklist.completedCount} of {checklist.totalCount} checks
          complete.
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Auto-detected checks update from live app data. Manual checks are saved for this household
          and month.
        </p>
        {checklist.reviewedAt ? (
          <p className="mt-1 text-xs font-medium text-text-muted">
            Reviewed at {new Date(checklist.reviewedAt).toLocaleString()}
          </p>
        ) : null}
        {reviewError ? <InlineAlert className="mt-3">{reviewError}</InlineAlert> : null}
      </div>
      <div className="grid gap-2 p-4">
        {reviewLoading ? <p className="text-sm text-text-muted">Loading review state...</p> : null}
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
              {item.isManual ? (
                <label className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-text-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-app-border text-brand-primary focus:ring-brand-primary"
                    checked={Boolean(item.isComplete)}
                    disabled={reviewSaving || Boolean(item.disabledReason)}
                    onChange={(event) =>
                      onToggleManualCheck?.(item.manualCheckId, event.target.checked)
                    }
                  />
                  <span>
                    {item.disabledReason || "Confirm this manual month-close step as complete."}
                  </span>
                </label>
              ) : null}
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
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-app-border p-4">
        {checklist.isReviewed ? (
          <Button
            type="button"
            variant="secondary"
            disabled={reviewSaving}
            onClick={onReopenReview}
          >
            {reviewSaving ? "Saving..." : "Reopen month as in progress"}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={!checklist.canMarkReviewed || reviewSaving}
            onClick={onMarkReviewed}
          >
            {reviewSaving ? "Saving..." : "Mark month as reviewed"}
          </Button>
        )}
      </div>
    </Card>
  );
}
