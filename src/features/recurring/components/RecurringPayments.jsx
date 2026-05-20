import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import LoadingMessage from "../../../components/ui/LoadingMessage.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatMonthLabel } from "../../../lib/formatters.js";
import { consumeNavigationTarget } from "../../../lib/navigationTargets.js";
import { recurringSections } from "../recurringSections.js";
import RecurringGenerationPanel from "./RecurringGenerationPanel.jsx";
import RecurringMigrationPanel from "./RecurringMigrationPanel.jsx";
import RecurringPaymentForm from "./RecurringPaymentForm.jsx";
import RecurringSectionPicker from "./RecurringSectionPicker.jsx";
import RecurringPaymentTable from "./RecurringPaymentTable.jsx";
import RecurringSummary from "./RecurringSummary.jsx";

export default function RecurringPayments({
  creditCards,
  cashAccounts = [],
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
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("this-month");
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const activeCards = creditCards.filter((card) => card.isActive);
  const currentSection =
    recurringSections.find((section) => section.id === activeSection) ?? recurringSections[0];

  useEffect(() => {
    const target = consumeNavigationTarget("recurring");
    if (!target) return;
    if (recurringSections.some((section) => section.id === target)) {
      setActiveSection(target);
    }
  }, []);

  useEffect(() => {
    if (!isTemplateModalOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSaving) closeTemplateModal();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, isTemplateModalOpen]);

  function openAddTemplateModal() {
    setEditingTemplate(null);
    setIsTemplateModalOpen(true);
  }

  function openEditTemplateModal(template) {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  }

  function closeTemplateModal() {
    if (isSaving) return;
    setEditingTemplate(null);
    setIsTemplateModalOpen(false);
  }

  async function handleSave(form, template) {
    if (template) {
      await onUpdateRecurringPayment(template.supabaseId ?? template.id, form);
    } else {
      await onCreateRecurringPayment(form);
    }
    setEditingTemplate(null);
    setIsTemplateModalOpen(false);
  }

  async function handleDelete(template) {
    await onDeleteRecurringPayment(template.supabaseId ?? template.id);
    if (editingTemplate?.id === template.id) {
      setEditingTemplate(null);
      setIsTemplateModalOpen(false);
    }
  }

  return (
    <section className="grid min-w-0 gap-6">
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {categoriesError ? <InlineAlert>{categoriesError}</InlineAlert> : null}

      <RecurringMigrationPanel
        localTemplates={localRecurringPayments}
        supabaseTemplates={recurringPayments}
        onImport={onImportLocalRecurringPayments}
        disabled={loading || isSaving}
      />

      <Card className="p-4 sm:p-5">
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500">Recurring payments</p>
            <h2 className="mt-1 break-words text-2xl font-semibold tracking-normal text-gray-950">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage bill templates and track what is paid each month.
            </p>
            {loading ? (
              <LoadingMessage className="mt-2">Loading recurring payments...</LoadingMessage>
            ) : null}
            {categoriesLoading ? (
              <LoadingMessage className="mt-2">Loading categories...</LoadingMessage>
            ) : null}
            {isSaving ? (
              <LoadingMessage className="mt-2">Saving recurring payments...</LoadingMessage>
            ) : null}
          </div>
          <Select
            label="Bill month"
            value={selectedMonth}
            onChange={(event) => {
              closeTemplateModal();
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

      <div className="grid gap-1">
        <h2 className="text-lg font-semibold text-text-main">Recurring workspace</h2>
        <p className="text-sm text-text-muted">{currentSection.description}</p>
      </div>

      <RecurringSectionPicker
        sections={recurringSections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {activeSection === "this-month" ? (
        <RecurringGenerationPanel
          monthKey={selectedMonth}
          templates={recurringPayments}
          recurringStatusByMonth={recurringStatusByMonth}
          categories={categories}
          cashAccounts={cashAccounts}
          creditCards={activeCards}
          onMarkPaid={onMarkRecurringPaid}
          onMarkUnpaid={onMarkRecurringUnpaid}
          onSkip={onSkipRecurringPayment}
          isSaving={isSaving}
        />
      ) : null}

      {activeSection === "templates" ? (
        <RecurringPaymentTable
          templates={recurringPayments}
          cards={activeCards}
          categories={categories}
          onAdd={openAddTemplateModal}
          onEdit={openEditTemplateModal}
          onDelete={handleDelete}
          isSaving={isSaving}
        />
      ) : null}

      {isTemplateModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto bg-gray-950/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recurring-template-modal-title"
        >
          <div className="flex max-h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div>
                <h2
                  id="recurring-template-modal-title"
                  className="text-lg font-semibold text-gray-950"
                >
                  {editingTemplate ? "Edit recurring payment" : "Add recurring payment"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Templates become monthly bills you can mark paid.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                onClick={closeTemplateModal}
                aria-label="Close recurring template modal"
                disabled={isSaving}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-8">
              <RecurringPaymentForm
                cards={activeCards}
                categories={categories}
                editingTemplate={editingTemplate}
                onCancel={closeTemplateModal}
                onSaved={handleSave}
                isSaving={isSaving}
                showHeader={false}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
