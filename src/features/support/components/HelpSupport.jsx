import { LifeBuoy, Mail, ShieldCheck, Wrench } from "lucide-react";
import { appMetadata } from "../../../app/appMetadata.js";
import Card from "../../../components/ui/Card.jsx";

const supportItems = [
  {
    title: "Check your data first",
    description:
      "Confirm the card, budget month, category, or transaction you are viewing before reporting an issue.",
  },
  {
    title: "Run a manual backup",
    description:
      "Before testing risky changes or imports, export a backup so household data can be restored if needed.",
  },
  {
    title: "Include the exact screen",
    description:
      "When asking for help, include the page name, browser, and what you expected to happen.",
  },
];

export default function HelpSupport() {
  return (
    <section className="grid gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm">
            <LifeBuoy size={26} strokeWidth={2.2} aria-hidden="true" />
          </div>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-text-main">
              Help / Support
            </h2>
            <p className="mt-4 text-sm leading-6 text-text-muted">
              Use this page for basic troubleshooting notes, safe testing reminders, and contact
              information for WalletFlow.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {supportItems.map((item) => (
          <Card key={item.title} className="p-5">
            <h3 className="text-lg font-semibold text-text-main">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-text-muted">{item.description}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-brand-accent"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-lg font-semibold text-text-main">Before reporting a bug</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Try refreshing the page, signing out and back in, and confirming the active
                household. If the issue involves data, export a backup before making more changes.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex gap-3">
            <Wrench size={20} className="mt-0.5 shrink-0 text-brand-secondary" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold text-text-main">Useful details to include</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Include the page name, the button or action used, the selected month, the household,
                and any visible error message. Screenshots help when the issue is visual.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex gap-3">
          <Mail size={20} className="mt-0.5 shrink-0 text-brand-secondary" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold text-text-main">Contact</h3>
            <p className="mt-3 text-sm text-text-muted">For feedback or support:</p>
            <a
              className="mt-1 inline-flex text-sm font-semibold text-brand-primary transition hover:text-brand-accent"
              href={`mailto:${appMetadata.supportEmail}`}
            >
              {appMetadata.supportEmail}
            </a>
          </div>
        </div>
      </Card>
    </section>
  );
}
