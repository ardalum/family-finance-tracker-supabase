import { useRef, useState } from "react";
import { CloudDownload, Download, FileSpreadsheet, RotateCcw, Trash2, Upload } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import { signOut } from "../../auth/authService.js";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";
import {
  deleteSupabaseAccount,
  exportBackup,
  exportSupabaseExcel,
  exportSupabaseBackup,
  importSupabaseBackupMerge,
  importBackupFile,
  previewSupabaseBackupImport,
  resetAllData,
} from "../backupService.js";

const summaryLabels = {
  creditCards: "Credit cards",
  monthlyCardBalances: "Monthly balances",
  budgetCategories: "Budget categories",
  transactions: "Transactions",
  transactionSplits: "Transaction splits",
  recurringPayments: "Recurring payments",
  recurringPaymentInstances: "Recurring instances",
};

export default function BackupPanel({ onDataChange, onSupabaseImportComplete }) {
  const { activeHouseholdId, activeHousehold } = useHouseholds();
  const inputRef = useRef(null);
  const cloudInputRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [isExportingCloud, setIsExportingCloud] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isPreviewingCloudImport, setIsPreviewingCloudImport] = useState(false);
  const [isImportingCloud, setIsImportingCloud] = useState(false);
  const [isWorkingLegacy, setIsWorkingLegacy] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [cloudImport, setCloudImport] = useState(null);

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

  async function handleExcelExport() {
    setIsExportingExcel(true);
    setMessage(null);

    try {
      showMessage(await exportSupabaseExcel(activeHouseholdId, activeHousehold));
    } finally {
      setIsExportingExcel(false);
    }
  }

  function handleExport() {
    showMessage(exportBackup());
  }

  function handleImportClick() {
    inputRef.current?.click();
  }

  function handleCloudImportClick() {
    cloudInputRef.current?.click();
  }

  async function handleCloudImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    setCloudImport(null);
    setMessage(null);
    setIsPreviewingCloudImport(true);

    try {
      const result = await previewSupabaseBackupImport(file, activeHouseholdId);
      if (!result.ok) {
        showMessage(result);
        return;
      }

      setCloudImport({
        backup: result.backup,
        preview: result.preview,
        fileName: file.name,
      });
      showMessage(result);
    } finally {
      setIsPreviewingCloudImport(false);
    }
  }

  async function handleCloudImportConfirm() {
    if (!cloudImport?.backup) return;

    const confirmed = window.confirm(
      "Import this backup into the current household? Existing data will not be deleted. Obvious duplicates will be skipped.",
    );
    if (!confirmed) return;

    setIsImportingCloud(true);
    setMessage(null);

    try {
      const result = await importSupabaseBackupMerge(activeHouseholdId, cloudImport.backup);
      showMessage(result);

      if (result.ok) {
        setCloudImport({
          ...cloudImport,
          result: result.counts,
        });
        await onSupabaseImportComplete?.();
      }
    } finally {
      setIsImportingCloud(false);
    }
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

  async function handleDeleteHouseholdData() {
    if (deletePhrase !== "DELETE") return;

    const confirmed = window.confirm(
      "This will permanently delete your account and this private household's finance data. This action cannot be undone.",
    );
    if (!confirmed) return;

    setIsDeletingData(true);
    setMessage(null);

    try {
      const result = await deleteSupabaseAccount(activeHouseholdId, deletePhrase);
      showMessage(result);
      if (result.ok) {
        await signOut();
      }
    } finally {
      setIsDeletingData(false);
    }
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
            <Button
              type="button"
              variant="secondary"
              onClick={handleExcelExport}
              disabled={isExportingExcel || !activeHouseholdId}
            >
              <FileSpreadsheet size={16} aria-hidden="true" />
              {isExportingExcel ? "Exporting..." : "Export to Excel"}
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Active household: {activeHousehold?.name ?? "No household selected"}
          </p>

          <div className="rounded-md border border-sky-100 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-950">
                  Import Supabase Backup
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Merge mode only. This will add missing records and avoid obvious duplicates.
                  It will not delete existing data.
                </p>
                <p className="mt-2 text-xs text-amber-700">
                  Recommended: Export a fresh Supabase backup before importing.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSupabaseExport}
                  disabled={isExportingCloud || !activeHouseholdId}
                  className="min-h-9 px-3 py-1.5 text-xs"
                >
                  <CloudDownload size={14} aria-hidden="true" />
                  Export current first
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloudImportClick}
                  disabled={isPreviewingCloudImport || isImportingCloud || !activeHouseholdId}
                >
                  <Upload size={16} aria-hidden="true" />
                  {isPreviewingCloudImport ? "Reading..." : "Choose backup file"}
                </Button>
              </div>
            </div>

            {cloudImport ? (
              <div className="mt-4 grid gap-3">
                <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  Preview for <span className="font-medium text-gray-900">{cloudImport.fileName}</span>
                </div>
                <ImportSummary counts={cloudImport.preview} />
                {cloudImport.result ? (
                  <div className="grid gap-2">
                    <p className="text-sm font-semibold text-gray-950">Import result</p>
                    <ImportSummary counts={cloudImport.result} />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={handleCloudImportConfirm}
                      disabled={isImportingCloud}
                    >
                      <Upload size={16} aria-hidden="true" />
                      {isImportingCloud ? "Importing..." : "Import backup in merge mode"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCloudImport(null)}
                      disabled={isImportingCloud}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : null}

            <input
              ref={cloudInputRef}
              className="hidden"
              type="file"
              accept="application/json,.json"
              onChange={handleCloudImportFile}
            />
          </div>
        </div>
      </Card>

      <Card className="border-red-200 bg-red-50/40 p-5">
        <div className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Danger Zone
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-950">
              Delete Account
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              This permanently deletes your Supabase Auth login and the active household only when
              you are its only active member and owner. Shared households or extra households you
              created will block deletion. The service role key stays server-side in a Supabase Edge
              Function and is never exposed in this browser app.
            </p>
          </div>

          <div className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700">
            This will permanently delete your account and this private household's finance data.
            This action cannot be undone.
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleExcelExport}
              disabled={isExportingExcel || !activeHouseholdId}
            >
              <FileSpreadsheet size={16} aria-hidden="true" />
              Export to Excel before deleting
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSupabaseExport}
              disabled={isExportingCloud || !activeHouseholdId}
            >
              <CloudDownload size={16} aria-hidden="true" />
              Export JSON backup before deleting
            </Button>
          </div>

          <div className="grid max-w-sm gap-3">
            <Input
              label="Type DELETE to confirm"
              value={deletePhrase}
              onChange={(event) => setDeletePhrase(event.target.value)}
              autoComplete="off"
            />
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteHouseholdData}
              disabled={deletePhrase !== "DELETE" || isDeletingData || !activeHouseholdId}
            >
              <Trash2 size={16} aria-hidden="true" />
              {isDeletingData ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
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

function ImportSummary({ counts }) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200">
      <div className="grid grid-cols-[1fr_auto_auto] bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>Data type</span>
        <span className="text-right">To import</span>
        <span className="text-right">Skipped</span>
      </div>
      {Object.entries(summaryLabels).map(([key, label]) => (
        <div
          key={key}
          className="grid grid-cols-[1fr_auto_auto] gap-4 border-t border-gray-100 px-3 py-2 text-sm"
        >
          <span className="text-gray-700">{label}</span>
          <span className="min-w-12 text-right font-medium text-gray-950">
            {counts?.[key]?.imported ?? 0}
          </span>
          <span className="min-w-12 text-right text-gray-500">
            {counts?.[key]?.skipped ?? 0}
          </span>
        </div>
      ))}
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
