import { UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";

export default function BudgetMigrationPanel({
  localBudgetsByMonth,
  supabaseBudgets,
  selectedMonth,
  onImport,
  disabled = false,
}) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const importableCount = useMemo(() => {
    const importedIds = new Set(supabaseBudgets.map((budget) => budget.importedLocalId).filter(Boolean));
    return (localBudgetsByMonth?.[selectedMonth] ?? []).filter(
      (budget) => !importedIds.has(budget.id),
    ).length;
  }, [localBudgetsByMonth, selectedMonth, supabaseBudgets]);

  const localMonthCount = localBudgetsByMonth?.[selectedMonth]?.length ?? 0;
  if (localMonthCount === 0) return null;

  async function handleImport() {
    setStatus("");
    setError("");
    setIsImporting(true);

    try {
      const importedBudgets = await onImport();
      setStatus(
        importedBudgets.length === 0
          ? "No new local budget categories to import."
          : `Imported ${importedBudgets.length} budget categor${importedBudgets.length === 1 ? "y" : "ies"}.`,
      );
    } catch (currentError) {
      setError(currentError.message || "Could not import local budget categories.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Import local budget categories</h2>
          <p className="mt-1 text-sm text-gray-500">
            Copy existing browser-saved categories for this month into this household.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {importableCount} of {localMonthCount} local categories ready to import.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleImport}
          disabled={disabled || isImporting || importableCount === 0}
        >
          <UploadCloud size={16} aria-hidden="true" />
          {isImporting ? "Importing..." : "Import categories"}
        </Button>
      </div>

      {status ? (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {status}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </Card>
  );
}
