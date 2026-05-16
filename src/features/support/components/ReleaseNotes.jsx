import { CheckCircle2, ClipboardList, Sparkles } from "lucide-react";
import { appMetadata } from "../../../app/appMetadata.js";
import Card from "../../../components/ui/Card.jsx";

const releaseNotes = [
  {
    version: appMetadata.releaseLabel,
    date: appMetadata.releaseDate,
    items: [
      "Renamed primary navigation labels to Dashboard, Cards, Budget, Spending, Bills, and Insights.",
      "Added Privacy Policy and Terms of Use pages.",
      "Enabled footer links for Privacy Policy, Terms of Use, and About.",
      "Added account menu access to support and release information.",
    ],
  },
  {
    version: "Frontend architecture cleanup",
    date: "May 2026",
    items: [
      "Moved feature data logic into focused hooks.",
      "Kept App.jsx focused on orchestration and app wiring.",
      "Added project verification scripts for formatting, build, tests, and lint.",
    ],
  },
];

export default function ReleaseNotes() {
  return (
    <section className="grid gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm">
            <Sparkles size={26} strokeWidth={2.2} aria-hidden="true" />
          </div>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              WalletFlow v{appMetadata.version}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-text-main">
              Release Notes
            </h2>
            <p className="mt-4 text-sm leading-6 text-text-muted">
              Review recent WalletFlow changes, cleanup passes, and user-facing improvements.
            </p>
          </div>
        </div>
      </Card>

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
            <ul className="mt-4 grid gap-3">
              {release.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-text-soft">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-brand-accent"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
