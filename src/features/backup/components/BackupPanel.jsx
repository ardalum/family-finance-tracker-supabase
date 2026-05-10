import { useRef, useState } from "react";
import { CloudDownload, Download, RotateCcw, Upload } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";
import {
  exportBackup,
  exportSupabaseBackup,
  importBackupFile,
  resetAllData,
} from "../backupService.js";

export default function BackupPanel({ onDataChange }) {
  const { activeHouseholdId, activeHousehold } = useHouseholds();
  const inputRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [isExportingCloud, setIsExportingCloud] = useState(false);
  const [isWorkingLegacy, setIsWorkingLegacy] = useState(false);

  function showMessage(result) {
    setMessage({
      type: result.ok ? "success" : "error",
      text: result.message,
    });
  }

  async function handleSupabaseExport() {
    setIsExportingCloud(true);
    setMessage(null);

    try {
      showMessage(await exportSupabaseBackup(activeHouseholdId, activeHousehold));
    } finally {
      setIsExportingCloud(false);
    }
  }

  function handleExport() {
    showMessage(exportBackup());
  }

  function handleImportClick() {
    inputRef.current?.click();
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    const confirmed = window.confirm(
      "Importing a backup will replace all current local data. Continue?",
    );
    if (!confirmed) return;

    setIsWorkingLegacy(true);
    const result = await importBackupFile(file);
    showMessage(result);
    if (result.ok) onDataChange(result.data);
    setIsWorkingLegacy(false);
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Delete all local finance tracker data? This cannot be undone unless you have a backup.",
    );
    if (!confirmed) return;

    setIsWorkingLegacy(true);
    const result = resetAllData();
    showMessage(result);
    onDataChange(result.data);
    setIsWorkingLegacy(false);
  }

  return (
    <div className="grid gap-5">
      <Card className="border-sky-200 bg-sky-50/40 p-5">
        <div className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Primary backup
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-950">
              Supabase Cloud Backup
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              Export the finance data for your active household from Supabase. This includes cards,
              monthly balances, budgets, transactions, splits, recurring payments, and recurring
              instances. Auth tokens, passwords, and secret keys are not included.
            </p>
          </div>

          {message ? <Message message={message} /> : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleSupabaseExport}
              disabled={isExportingCloud || !activeHouseholdId}
              className="bg-sky-700 hover:bg-sky-800"
            >
              <CloudDownload size={16} aria-hidden="true" />
              {isExportingCloud ? "Exporting..." : "Export Supabase Backup"}
            </Button>
            <Button type="button" variant="secondary" disabled>
              <Upload size={16} aria-hidden="true" />
              Supabase import coming soon
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Active household: {activeHousehold?.name ?? "No household selected"}
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Legacy tools
                </p>
                <h2 className="mt-1 text-lg font-semibold text-gray-950">
                  Legacy localStorage Backup
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-gray-500">
                  These tools only export, import, or reset old browser localStorage data. They do
                  not back up or restore your current Supabase cloud data.
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                Secondary
              </span>
            </div>
          </summary>

          <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Use this only if you still need access to the original localStorage backup format.
              Supabase import is intentionally separate and not enabled yet.
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleExport}
                disabled={isWorkingLegacy}
              >
                <Download size={16} aria-hidden="true" />
                Export Legacy Backup
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleImportClick}
                disabled={isWorkingLegacy}
              >
                <Upload size={16} aria-hidden="true" />
                Import Legacy Backup
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleReset}
                disabled={isWorkingLegacy}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Reset Legacy Data
              </Button>
            </div>
          </div>
        </details>

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
        />
      </Card>
    </div>
  );
}

function Message({ message }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${
        message.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message.text}
    </div>
  );
}
