import { useMemo, useState } from "react";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatMonthLabel } from "../../../lib/formatters.js";
import RecurringGenerationPanel from "./RecurringGenerationPanel.jsx";
import RecurringMigrationPanel from "./RecurringMigrationPanel.jsx";
import RecurringPaymentForm from "./RecurringPaymentForm.jsx";
import RecurringPaymentTable from "./RecurringPaymentTable.jsx";
import RecurringSummary from "./RecurringSummary.jsx";

export default function RecurringPayments({
  creditCards,
  categories,
  recurringPayments,
  recurringStatusByMonth,
  transactions,
  localRecurringPayments,
  selectedMonth = getCurrentMonthKey(),
  loading = false,
  error = "",
  isSaving = false,
  categoriesLoading = false,
  categoriesError = "",
  onMonthChange,
  onCreateRecurringPayment,
  onUpdateRecurringPayment,
  onDeleteRecurringPayment,
  onMarkRecurringPaid,
  onMarkRecurringUnpaid,
  onSkipRecurringPayment,
  onImportLocalRecurringPayments,
}) {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const activeCards = creditCards.filter((card) => card.isActive);

  async function handleSave(form, template) {
    if (template) {
      await onUpdateRecurringPayment(template.supabaseId ?? template.id, form);
    } else {
      await onCreateRecurringPayment(form);
    }
    setEditingTemplate(null);
  }

  async function handleDelete(template) {
    await onDeleteRecurringPayment(template.supabaseId ?? template.id);
    if (editingTemplate?.id === template.id) setEditingTemplate(null);
  }

  return (
    <section className="grid gap-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {categoriesError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {categoriesError}
        </div>
      ) : null}

      <RecurringMigrationPanel
        localTemplates={localRecurringPayments}
        supabaseTemplates={recurringPayments}
        onImport={onImportLocalRecurringPayments}
        disabled={loading || isSaving}
      />

      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-gray-500">Recurring payments</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-gray-950">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage bill templates and track what is paid each month.
            </p>
            {loading ? <p className="mt-2 text-sm text-gray-500">Loading recurring payments...</p> : null}
            {categoriesLoading ? <p className="mt-2 text-sm text-gray-500">Loading categories...</p> : null}
            {isSaving ? <p className="mt-2 text-sm text-gray-500">Saving recurring payments...</p> : null}
          </div>
          <Select
            label="Generation month"
            value={selectedMonth}
            onChange={(event) => {
              setEditingTemplate(null);
              onMonthChange(event.target.value);
            }}
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <RecurringSummary
        templates={recurringPayments}
        monthKey={selectedMonth}
        recurringStatusByMonth={recurringStatusByMonth}
      />

      <RecurringGenerationPanel
        monthKey={selectedMonth}
        templates={recurringPayments}
        recurringStatusByMonth={recurringStatusByMonth}
        categories={categories}
        onMarkPaid={onMarkRecurringPaid}
        onMarkUnpaid={onMarkRecurringUnpaid}
        onSkip={onSkipRecurringPayment}
        isSaving={isSaving}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <RecurringPaymentTable
          templates={recurringPayments}
          cards={activeCards}
          categories={categories}
          onEdit={setEditingTemplate}
          onDelete={handleDelete}
          isSaving={isSaving}
        />

        <Card className="h-fit p-5">
          <RecurringPaymentForm
            cards={activeCards}
            categories={categories}
            editingTemplate={editingTemplate}
            onCancel={() => setEditingTemplate(null)}
            onSaved={handleSave}
            isSaving={isSaving}
          />
        </Card>
      </div>
    </section>
  );
}
