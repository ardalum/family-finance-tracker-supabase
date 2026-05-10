import BackupPanel from "./BackupPanel.jsx";

export default function BackupRestore({ onDataChange, onSupabaseImportComplete }) {
  return (
    <section>
      <BackupPanel
        onDataChange={onDataChange}
        onSupabaseImportComplete={onSupabaseImportComplete}
      />
    </section>
  );
}
