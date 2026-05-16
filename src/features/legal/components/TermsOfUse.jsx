import { AlertTriangle, CheckCircle2, FileText, Scale, ShieldAlert } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";

const userResponsibilities = [
  "Enter accurate information and review it regularly",
  "Verify balances, due dates, and payments with the original financial institution or service provider",
  "Protect login credentials and exported backup files",
  "Use WalletFlow only for lawful personal or household finance tracking",
];

const notAllowedItems = [
  "Relying on WalletFlow as the only source for payment due dates or account balances",
  "Using the app to store information that does not belong to the household",
  "Attempting to bypass authentication, household access controls, or data protections",
  "Treating WalletFlow as financial, tax, legal, investment, credit, or lending advice",
];

export default function TermsOfUse() {
  return (
    <section className="grid gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm">
            <Scale size={26} strokeWidth={2.2} aria-hidden="true" />
          </div>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Last updated: May 16, 2026
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-text-main">
              Terms of Use
            </h2>
            <p className="mt-4 text-sm leading-6 text-text-muted">
              These terms explain the basic rules for using WalletFlow. By using the app, users
              agree to use it as a personal tracking tool and to verify important financial details
              outside the app.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex gap-3">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-brand-accent"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-lg font-semibold text-text-main">User responsibilities</h3>
              <ul className="mt-4 grid gap-3">
                {userResponsibilities.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-text-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-status-warning"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-lg font-semibold text-text-main">Not allowed</h3>
              <ul className="mt-4 grid gap-3">
                {notAllowedItems.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-text-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-status-warning" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex gap-3">
          <ShieldAlert
            size={20}
            className="mt-0.5 shrink-0 text-status-warning"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-lg font-semibold text-text-main">No financial advice</h3>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              WalletFlow is only for personal tracking and organization. It does not provide
              financial, legal, tax, credit, lending, or investment advice. Users should consult a
              qualified professional before making decisions that affect money, taxes, credit,
              loans, insurance, or investments.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex gap-3">
            <FileText
              size={20}
              className="mt-0.5 shrink-0 text-brand-secondary"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-lg font-semibold text-text-main">Accuracy and availability</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                WalletFlow depends on user-entered data. The app may contain mistakes, downtime, or
                incomplete information. Users remain responsible for checking official statements,
                account portals, lender notices, and provider communications.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex gap-3">
            <FileText
              size={20}
              className="mt-0.5 shrink-0 text-brand-secondary"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-lg font-semibold text-text-main">Backups and exports</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Exported backup files may contain sensitive finance data. Users are responsible for
                storing those files safely and deleting copies that are no longer needed.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-lg font-semibold text-text-main">Changes to these terms</h3>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          These terms may be updated as WalletFlow changes. Continued use of the app after updates
          means the user accepts the revised terms.
        </p>
      </Card>
    </section>
  );
}
