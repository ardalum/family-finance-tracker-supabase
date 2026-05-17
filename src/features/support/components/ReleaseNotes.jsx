import { ClipboardList, Sparkles } from "lucide-react";
import { appMetadata } from "../../../app/appMetadata.js";
import CheckList from "../../../components/layout/CheckList.jsx";
import PageHero from "../../../components/layout/PageHero.jsx";
import Card from "../../../components/ui/Card.jsx";
import { releaseNotes } from "../releaseNotesData.js";

export default function ReleaseNotes() {
  return (
    <section className="grid gap-6">
      <PageHero
        icon={Sparkles}
        eyebrow={`WalletFlow v${appMetadata.version}`}
        title="Release Notes"
        description="Review recent WalletFlow changes, cleanup passes, and user-facing improvements."
      />

      <div className="grid gap-6">
        {releaseNotes.map((release) => (
          <Card key={release.version} className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-main">{release.version}</h3>
                <p className="mt-1 text-sm text-text-muted">{release.date}</p>
              </div>
              <ClipboardList
                size={20}
                className="hidden shrink-0 text-brand-secondary sm:block"
                aria-hidden="true"
              />
            </div>
            <CheckList items={release.items} />
          </Card>
        ))}
      </div>
    </section>
  );
}
