import { useEffect, useMemo, useState } from "react";
import Card from "../../../components/ui/Card.jsx";
import { buildCashAccountOptions } from "../../accounts/accountsService.js";
import { CARD_PAYMENT_OUTSIDE_ACCOUNT } from "../../creditCards/statementPaymentUtils.js";
import { formatLinkedCardLabel } from "../../creditCards/cardDisplayUtils.js";
import { LIQUID_ACCOUNT_TYPES } from "../../spending/spendingService.js";
import {
  buildRecurringPaidDraft,
  RECURRING_PAID_FROM_CREDIT_CARD,
} from "../recurringPaymentFlow.js";
import {
  getMonthlyRecurringRows,
  getRecurringDueDate,
  getUpcomingRecurringRows,
} from "../recurringService.js";
import RecurringBillRow from "./RecurringBillRow.jsx";
import RecurringPaymentModal from "./RecurringPaymentModal.jsx";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

const messageStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-700",
};

export default function RecurringGenerationPanel({
  monthKey,
  templates,
  recurringStatusByMonth,
  categories,
  cashAccounts = [],
  creditCards = [],
  onMarkPaid,
  onMarkUnpaid,
  onSkip,
  onEditTemplate,
  isSaving = false,
}) {
  const billRows = useMemo(
    () => getMonthlyRecurringRows(templates, monthKey, recurringStatusByMonth),
    [monthKey, recurringStatusByMonth, templates],
  );
  const upcomingRows = useMemo(
    () => getUpcomingRecurringRows(templates, monthKey, recurringStatusByMonth, { windowDays: 14 }),
    [monthKey, recurringStatusByMonth, templates],
  );
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState(null);
  const [paymentModalRow, setPaymentModalRow] = useState(null);
  const [paymentModalDraft, setPaymentModalDraft] = useState(null);
  const cashAccountOptions = useMemo(
    () =>
      buildCashAccountOptions(
        cashAccounts.filter((account) => LIQUID_ACCOUNT_TYPES.has(account.accountType)),
      ),
    [cashAccounts],
  );

  const workflowCounts = useMemo(
    () => ({
      paid: billRows.filter((row) => row.instance?.status === "paid").length,
      skipped: billRows.filter((row) => row.instance?.status === "skipped").length,
      needsAction: billRows.filter((row) => !["paid", "skipped"].includes(row.instance?.status))
        .length,
      pastDue: billRows.filter((row) => row.displayStatus === "Past due").length,
    }),
    [billRows],
  );

  useEffect(() => {
    setMessage(null);
    const allRows = [...billRows, ...upcomingRows];
    setDrafts(
      Object.fromEntries(
        allRows.map((row) => {
          const actualAmount =
            row.instance?.actualAmount ??
            (row.template.billType === "fixed" ? row.template.estimatedAmount : "");
          return [
            row.template.id,
            {
              actualAmount: actualAmount === "" ? "" : String(actualAmount),
              paidDate: row.instance?.paidDate ?? todayDate(),
            },
          ];
        }),
      ),
    );
  }, [billRows, upcomingRows]);

  function updateDraft(templateId, patch) {
    setMessage(null);
    setDrafts((current) => ({
      ...current,
      [templateId]: {
        ...(current[templateId] ?? {}),
        ...patch,
      },
    }));
  }

  function getPaymentAccountOptions(row) {
    const options = [...cashAccountOptions];
    if (row?.template?.paymentMethod === "Credit Card") {
      const card = creditCards.find((current) => current.id === row.template.cardId);
      const label = card ? `Credit card: ${formatLinkedCardLabel(card)}` : "Credit card";
      options.push({ value: RECURRING_PAID_FROM_CREDIT_CARD, label });
    }
    options.push({ value: CARD_PAYMENT_OUTSIDE_ACCOUNT, label: "Outside / untracked account" });
    return options;
  }

  function handleStartMarkPaid(row) {
    const draft = drafts[row.template.id] ?? {};
    setPaymentModalRow(row);
    setPaymentModalDraft(
      buildRecurringPaidDraft({
        row,
        monthKey: row.monthKey || monthKey,
        existingPaidFromAccount: row.instance?.paidFromAccount || "",
        templateAutopayAccount: row.template?.autopayPaymentAccountId || "",
        todayDate: draft.paidDate,
      }),
    );
    setMessage(null);
  }

  async function handleMarkPaid(row, modalDraft) {
    const amount = Number(modalDraft?.paidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage({
        type: "error",
        text: "Enter an amount greater than zero before saving payment.",
      });
      return;
    }

    try {
      await onMarkPaid({
        template: row.template,
        monthKey: row.monthKey || monthKey,
        actualAmount:
          row.template.billType === "fixed" ? Number(row.template.estimatedAmount || 0) : amount,
        paidDate:
          modalDraft?.paidDate ||
          getRecurringDueDate(row.monthKey || monthKey, row.template.dueDay),
        paidFromAccount: modalDraft?.paidFromAccount || CARD_PAYMENT_OUTSIDE_ACCOUNT,
      });
      setPaymentModalRow(null);
      setPaymentModalDraft(null);
      setMessage({
        type: "success",
        text: `${row.template.name} marked paid. A linked spending transaction was created or updated, not duplicated.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not mark recurring bill paid." });
    }
  }

  async function handleMarkUnpaid(row) {
    try {
      await onMarkUnpaid(row);
      setMessage({
        type: "warning",
        text: `${row.template.name} marked unpaid. This month's linked spending entry was cleared.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not mark recurring bill unpaid." });
    }
  }

  async function handleSkip(row) {
    try {
      await onSkip(row);
      setMessage({
        type: "warning",
        text: `${row.template.name} skipped for this month. No spending transaction was created.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not skip recurring bill." });
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid min-w-0 gap-4 border-b border-gray-200 p-4 sm:p-5">
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-950">Monthly recurring bills</h3>
            <p className="mt-1 text-sm text-gray-500">
              Review each bill, then mark it paid. Fixed bills use the template amount. Variable
              bills can be adjusted before payment. Paid bills create or update one linked spending
              transaction.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
            <StatusCount label="Needs action" value={workflowCounts.needsAction} />
            <StatusCount label="Paid" value={workflowCounts.paid} />
            <StatusCount label="Skipped" value={workflowCounts.skipped} />
            <StatusCount
              label="Past due"
              value={workflowCounts.pastDue}
              tone={workflowCounts.pastDue > 0 ? "danger" : "default"}
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Tip: Fixed bills use their template amount automatically. Variable bills keep the editable
          actual amount field. Use <span className="font-semibold">Mark Unpaid</span> to clear this
          month's linked spending entry. Autopay-enabled templates still require payment
          confirmation so account balance changes are never silent.
        </div>

        {message ? (
          <p
            className={`rounded-md border px-3 py-2 text-sm ${messageStyles[message.type] ?? messageStyles.success}`}
          >
            {message.text}
          </p>
        ) : null}
      </div>

      {billRows.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          No active recurring payments apply to this month.
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-normal text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Bill</th>
                <th className="px-5 py-3 font-semibold">Due date</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Estimated</th>
                <th className="px-5 py-3 font-semibold">Actual</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Paid date</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {billRows.map((row) => (
                <RecurringBillRow
                  key={row.template.id}
                  row={row}
                  categories={categories}
                  draft={drafts[row.template.id] ?? {}}
                  isSaving={isSaving}
                  onDraftChange={updateDraft}
                  onStartMarkPaid={handleStartMarkPaid}
                  onMarkUnpaid={handleMarkUnpaid}
                  onSkip={handleSkip}
                  onEdit={onEditTemplate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {upcomingRows.length > 0 ? (
        <div className="border-t border-gray-200">
          <div className="bg-blue-50/60 px-5 py-3 text-sm text-blue-900">
            <p className="font-semibold">Due soon from next month</p>
            <p className="text-xs text-blue-800">
              Bills due within 14 days can be paid early. The due month stays the same, but payment
              date and account impact follow when and how you pay.
            </p>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-blue-50 text-xs uppercase tracking-normal text-blue-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Bill</th>
                  <th className="px-5 py-3 font-semibold">Due date</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Estimated</th>
                  <th className="px-5 py-3 font-semibold">Actual</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Paid date</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingRows.map((row) => (
                  <RecurringBillRow
                    key={`upcoming-${row.monthKey}-${row.template.id}`}
                    row={row}
                    categories={categories}
                    draft={drafts[row.template.id] ?? {}}
                    isSaving={isSaving}
                    onDraftChange={updateDraft}
                    onStartMarkPaid={handleStartMarkPaid}
                    onMarkUnpaid={handleMarkUnpaid}
                    onSkip={handleSkip}
                    onEdit={onEditTemplate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <RecurringPaymentModal
        open={Boolean(paymentModalRow)}
        billName={paymentModalRow?.template?.name || ""}
        draft={paymentModalDraft}
        accountOptions={paymentModalRow ? getPaymentAccountOptions(paymentModalRow) : []}
        isSaving={isSaving}
        onCancel={() => {
          setPaymentModalRow(null);
          setPaymentModalDraft(null);
        }}
        onSave={(modalDraft) => {
          if (!paymentModalRow) return;
          handleMarkPaid(paymentModalRow, modalDraft);
        }}
      />
    </Card>
  );
}

function StatusCount({ label, value, tone = "default" }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}
    >
      <p className="font-semibold text-gray-950">{value}</p>
      <p>{label}</p>
    </div>
  );
}
