import { UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";

export default function RecurringMigrationPanel({
  localTemplates,
  supabaseTemplates,
  onImport,
  disabled = false,
}) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const importableCount = useMemo(() => {
    const importedIds = new Set(supabaseTemplates.map((template) => template.importedLocalId).filter(Boolean));
    return localTemplates.filter((template) => !importedIds.has(template.id)).length;
  }, [localTemplates, supabaseTemplates]);

  if (localTemplates.length === 0) return null;

  async function handleImport() {
    setStatus("");
    setError("");
    setIsImporting(true);

    try {
      const imported = await onImport();
      setStatus(
        imported.length === 0
          ? "No new local recurring payments to import."
          : `Imported ${imported.length} recurring payment${imported.length === 1 ? "" : "s"}.`,
      );
    } catch (currentError) {
      setError(currentError.message || "Could not import local recurring payments.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Import local recurring payments</h2>
          <p className="mt-1 text-sm text-gray-500">
            Copy existing browser-saved recurring templates into this household.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {importableCount} of {localTemplates.length} local templates ready to import.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleImport}
          disabled={disabled || isImporting || importableCount === 0}
        >
          <UploadCloud size={16} aria-hidden="true" />
          {isImporting ? "Importing..." : "Import templates"}
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
