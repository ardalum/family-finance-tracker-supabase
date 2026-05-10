import { UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";

export default function SpendingMigrationPanel({
  localTransactions,
  supabaseTransactions,
  selectedMonth,
  onImport,
  disabled = false,
}) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const localMonthTransactions = useMemo(
    () => localTransactions.filter((transaction) => transaction.date?.startsWith(`${selectedMonth}-`)),
    [localTransactions, selectedMonth],
  );

  const importableCount = useMemo(() => {
    const importedIds = new Set(
      supabaseTransactions.map((transaction) => transaction.importedLocalId).filter(Boolean),
    );
    return localMonthTransactions.filter((transaction) => !importedIds.has(transaction.id)).length;
  }, [localMonthTransactions, supabaseTransactions]);

  if (localMonthTransactions.length === 0) return null;

  async function handleImport() {
    setStatus("");
    setError("");
    setIsImporting(true);

    try {
      const importedIds = await onImport(localMonthTransactions);
      setStatus(
        importedIds.length === 0
          ? "No new local transactions to import."
          : `Imported ${importedIds.length} transaction${importedIds.length === 1 ? "" : "s"}.`,
      );
    } catch (currentError) {
      setError(currentError.message || "Could not import local spending transactions.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Import local spending</h2>
          <p className="mt-1 text-sm text-gray-500">
            Copy existing browser-saved transactions for this month into this household.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {importableCount} of {localMonthTransactions.length} local transactions ready to import.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleImport}
          disabled={disabled || isImporting || importableCount === 0}
        >
          <UploadCloud size={16} aria-hidden="true" />
          {isImporting ? "Importing..." : "Import transactions"}
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
