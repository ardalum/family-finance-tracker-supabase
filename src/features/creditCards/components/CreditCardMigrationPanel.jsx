import { UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";

export default function CreditCardMigrationPanel({
  localCards,
  supabaseCards,
  onImport,
  disabled = false,
}) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const importableCards = useMemo(() => {
    const importedIds = new Set(supabaseCards.map((card) => card.importedLocalId).filter(Boolean));
    return localCards.filter((card) => !importedIds.has(card.id));
  }, [localCards, supabaseCards]);

  if (localCards.length === 0) return null;

  async function handleImport() {
    setStatus("");
    setError("");
    setIsImporting(true);

    try {
      const importedCards = await onImport(importableCards);
      setStatus(
        importedCards.length === 0
          ? "No new local cards to import."
          : `Imported ${importedCards.length} local card${importedCards.length === 1 ? "" : "s"}.`,
      );
    } catch (currentError) {
      setError(currentError.message || "Could not import local credit cards.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Import local credit cards</h2>
          <p className="mt-1 text-sm text-gray-500">
            Copy existing browser-saved cards into this household.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {importableCards.length} of {localCards.length} local cards ready to import.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleImport}
          disabled={disabled || isImporting || importableCards.length === 0}
        >
          <UploadCloud size={16} aria-hidden="true" />
          {isImporting ? "Importing..." : "Import cards"}
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
