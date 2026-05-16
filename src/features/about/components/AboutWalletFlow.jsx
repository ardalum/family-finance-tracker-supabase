import { CheckCircle2, Mail, ShieldAlert, WalletCards } from "lucide-react";
import { appMetadata } from "../../../app/appMetadata.js";
import Card from "../../../components/ui/Card.jsx";

const trackingItems = [
  "Track credit card limits, balances, due dates, and payment status",
  "Manage monthly budget categories",
  "Record and review transactions",
  "Track recurring payments such as rent, subscriptions, utilities, insurance, and other fixed bills",
  "Review spending patterns through dashboard summaries and insights",
];

export default function AboutWalletFlow() {
  return (
    <section className="grid gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm">
            <WalletCards size={26} strokeWidth={2.2} aria-hidden="true" />
            <span className="absolute bottom-2 right-2 h-1.5 w-6 rounded-full bg-brand-accent" />
          </div>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-text-main">
              <span className="text-brand-primary">Wallet</span>
              <span className="text-brand-accent">Flow</span>
            </h2>
            <p className="mt-2 text-base font-medium text-text-soft">
              Track your cards, budget, and spending in one clear place.
            </p>
            <p className="mt-4 text-sm leading-6 text-text-muted">
              WalletFlow is a practical household finance tracker designed to help users organize
              credit cards, monthly budgets, transactions, and recurring payments in one clean
              dashboard.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-text-main">What WalletFlow Helps Track</h3>
          <ul className="mt-4 grid gap-3">
            {trackingItems.map((item) => (
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

        <Card className="p-5">
          <h3 className="text-lg font-semibold text-text-main">Product Details</h3>
          <dl className="mt-4 grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-text-muted">Created by</dt>
              <dd className="mt-1 font-semibold text-text-main">Arvin Dalumpines</dd>
            </div>
            <div>
              <dt className="font-medium text-text-muted">Version</dt>
              <dd className="mt-1 font-semibold text-text-main">{appMetadata.version}</dd>
            </div>
            <div>
              <dt className="font-medium text-text-muted">Release</dt>
              <dd className="mt-1 font-semibold text-text-main">{appMetadata.releaseLabel}</dd>
            </div>
          </dl>
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
            <h3 className="text-lg font-semibold text-text-main">Disclaimer</h3>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              WalletFlow is for personal tracking and organization only. It does not provide
              financial, legal, tax, or investment advice. Always verify balances, due dates,
              payments, and account details with your financial institutions, lenders, service
              providers, or qualified professionals.
            </p>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              WalletFlow only tracks information that users enter into the app. It is not a bank,
              lender, payment processor, or financial institution.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex gap-3">
          <Mail size={20} className="mt-0.5 shrink-0 text-brand-secondary" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold text-text-main">Support / Contact</h3>
            <p className="mt-3 text-sm text-text-muted">For questions, feedback, or support:</p>
            <a
              className="mt-1 inline-flex text-sm font-semibold text-brand-primary transition hover:text-brand-accent"
              href="mailto:arvin0958@gmail.com"
            >
              arvin0958@gmail.com
            </a>
          </div>
        </div>
      </Card>
    </section>
  );
}
