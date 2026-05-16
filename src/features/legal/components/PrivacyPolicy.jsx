import { Database, Download, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";

const collectedItems = [
  {
    title: "Account and session information",
    description:
      "WalletFlow may use sign-in details, session status, and profile identity information so the app can identify the signed-in user.",
  },
  {
    title: "Household and finance tracking data",
    description:
      "WalletFlow stores the household, credit card, budget, spending, recurring payment, and related notes that users enter into the app.",
  },
  {
    title: "App settings and backup data",
    description:
      "WalletFlow may store preferences, selected views, legacy local data, and exported backup files created by the user.",
  },
];

const usageItems = [
  "Provide access to the correct household finance workspace",
  "Calculate dashboards, budget totals, spending summaries, and insights",
  "Save app preferences and support backup or restore workflows",
  "Troubleshoot app behavior and protect the integrity of household data",
];

export default function PrivacyPolicy() {
  return (
    <section className="grid gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm">
            <ShieldCheck size={26} strokeWidth={2.2} aria-hidden="true" />
          </div>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Last updated: May 16, 2026
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-text-main">
              Privacy Policy
            </h2>
            <p className="mt-4 text-sm leading-6 text-text-muted">
              WalletFlow is a personal household finance tracker created by
              Arvin Dalumpines. This policy explains what the app is designed to
              collect, store, and help users control.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {collectedItems.map((item) => (
          <Card key={item.title} className="p-5">
            <h3 className="text-lg font-semibold text-text-main">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              {item.description}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex gap-3">
          <Database
            size={20}
            className="mt-0.5 shrink-0 text-brand-secondary"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-lg font-semibold text-text-main">
              How information is used
            </h3>
            <ul className="mt-4 grid gap-3">
              {usageItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-text-soft"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex gap-3">
            <LockKeyhole
              size={20}
              className="mt-0.5 shrink-0 text-brand-primary"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-lg font-semibold text-text-main">
                Data storage and security
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                WalletFlow uses Supabase for account authentication and
                household data storage. Some preferences or legacy backup data
                may also be stored in the browser. Users should protect their
                login credentials and only use trusted devices.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex gap-3">
            <Download
              size={20}
              className="mt-0.5 shrink-0 text-brand-secondary"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-lg font-semibold text-text-main">
                Backups and exports
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Exported backup files can contain sensitive household finance
                data. Users are responsible for storing exported files securely
                and deleting old copies when they are no longer needed.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex gap-3">
          <Trash2
            size={20}
            className="mt-0.5 shrink-0 text-status-warning"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-lg font-semibold text-text-main">
              Data deletion
            </h3>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              WalletFlow should be treated as a user-managed finance tracker.
              Users may remove records they no longer want to keep. Full account
              or household deletion may require manual support until
              self-service deletion controls are added.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-lg font-semibold text-text-main">
          What WalletFlow does not do
        </h3>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          WalletFlow does not connect directly to bank accounts, pull credit
          scores, process payments, sell user finance data, or provide
          financial, legal, tax, or investment advice.
        </p>
      </Card>
    </section>
  );
}
