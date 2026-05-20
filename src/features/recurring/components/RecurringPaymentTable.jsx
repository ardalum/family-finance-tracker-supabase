import { useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Edit,
  ExternalLink,
  Plus,
  ReceiptText,
  Trash2,
  X,
} from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getCategoryName } from "../../spending/spendingService.js";

export default function RecurringPaymentTable({
  templates,
  cards,
  categories,
  onAdd,
  onEdit,
  onDelete,
  isSaving = false,
}) {
  const [templatePendingDelete, setTemplatePendingDelete] = useState(null);

  async function confirmDelete() {
    if (!templatePendingDelete) return;
    await onDelete(templatePendingDelete);
    setTemplatePendingDelete(null);
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="grid min-w-0 gap-3 border-b border-app-border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-text-main">Recurring templates</h3>
            <p className="mt-1 text-sm text-text-muted">
              These templates become monthly bills in the selected month.
            </p>
          </div>
          <Button type="button" className="w-full sm:w-auto" onClick={onAdd} disabled={isSaving}>
            <Plus size={16} aria-hidden="true" />
            Add template
          </Button>
        </div>

        {templates.length === 0 ? (
          <div className="grid gap-3 p-8 text-center text-sm text-text-muted">
            <p className="font-semibold text-text-main">No recurring payment templates yet</p>
            <p>
              Add bills like rent, utilities, insurance, subscriptions, and recurring card charges.
            </p>
          </div>
        ) : (
          <div className="grid min-w-0 gap-3 p-4">
            {templates.map((template) => {
              const card = cards.find((item) => item.id === template.cardId);
              return (
                <article
                  key={template.id}
                  className="grid min-w-0 gap-4 rounded-2xl border border-app-border bg-app-surface p-4 transition hover:border-brand-primary/30 hover:bg-app-background"
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h4 className="min-w-0 text-base font-semibold text-text-main">
                          {template.name}
                        </h4>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${template.active ? "bg-status-successBg text-status-successDark ring-status-successBg" : "bg-app-muted text-text-muted ring-app-muted"}`}
                        >
                          {template.active ? "Active" : "Inactive"}
                        </span>
                        {template.autopayEnabled ? (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                            Autopay enabled
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-text-muted">
                        {getCategoryName(template.categoryId, categories)} ·{" "}
                        {template.billType === "fixed" ? "Fixed" : "Variable"}
                      </p>
                    </div>

                    <div className="min-w-0 text-left sm:text-right">
                      <p className="break-words text-lg font-semibold text-text-main">
                        {formatCurrency(template.estimatedAmount)}
                      </p>
                      <p className="text-xs font-medium text-text-muted">
                        Estimated monthly amount
                      </p>
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-3 text-sm text-text-soft md:grid-cols-3">
                    <TemplateDetail icon={CalendarDays} label="Due">
                      Day {template.dueDay}
                    </TemplateDetail>
                    <TemplateDetail icon={CreditCard} label="Payment">
                      <span>{template.paymentMethod}</span>
                      {template.paymentMethod === "Credit Card" ? (
                        <span className="truncate text-xs text-text-muted">
                          {card ? <LinkedCardName card={card} /> : "Needs review: deleted card"}
                        </span>
                      ) : null}
                    </TemplateDetail>
                    <TemplateDetail icon={ReceiptText} label="Schedule">
                      <span>{formatMonthRange(template.startMonth, template.endMonth)}</span>
                    </TemplateDetail>
                  </div>

                  {template.notes ? (
                    <p className="rounded-xl bg-app-background px-3 py-2 text-sm text-text-muted">
                      {template.notes}
                    </p>
                  ) : null}
                  {template.portalUrl ? (
                    <div>
                      <a
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
                        href={template.portalUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open portal
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2 border-t border-app-border pt-3 sm:flex sm:flex-wrap sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-9 px-3 py-1.5 text-sm"
                      onClick={() => onEdit(template)}
                      disabled={isSaving}
                      aria-label={`Edit ${template.name}`}
                    >
                      <Edit size={16} aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="min-h-9 px-3 py-1.5 text-sm"
                      onClick={() => setTemplatePendingDelete(template)}
                      disabled={isSaving}
                      aria-label={`Delete ${template.name}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      {templatePendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gray-950/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-recurring-template-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
              <div>
                <h2
                  id="delete-recurring-template-title"
                  className="text-lg font-semibold text-gray-950"
                >
                  Delete recurring template?
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This removes the bill template going forward. Existing transactions are not
                  deleted here.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                onClick={() => setTemplatePendingDelete(null)}
                disabled={isSaving}
                aria-label="Close delete confirmation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-4 p-5">
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">{templatePendingDelete.name}</p>
                <p className="mt-1">
                  {formatCurrency(templatePendingDelete.estimatedAmount)} · Day{" "}
                  {templatePendingDelete.dueDay} · {templatePendingDelete.paymentMethod}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setTemplatePendingDelete(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="button" variant="danger" onClick={confirmDelete} disabled={isSaving}>
                  <Trash2 size={16} aria-hidden="true" />
                  {isSaving ? "Deleting..." : "Delete template"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TemplateDetail({ icon: Icon, label, children }) {
  return (
    <div className="grid min-w-0 gap-1 rounded-xl bg-app-background px-3 py-2">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-normal text-text-muted">
        <Icon size={14} aria-hidden="true" />
        {label}
      </p>
      <div className="grid min-w-0 gap-0.5 font-medium text-text-soft">{children}</div>
    </div>
  );
}

function formatMonthRange(startMonth, endMonth) {
  if (!startMonth && !endMonth) return "No schedule set";
  if (!endMonth) return `Starts ${startMonth}`;
  return `${startMonth} to ${endMonth}`;
}
