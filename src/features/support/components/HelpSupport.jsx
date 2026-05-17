import { LifeBuoy, Mail, ShieldCheck, Wrench } from "lucide-react";
import { appMetadata } from "../../../app/appMetadata.js";
import InfoCard from "../../../components/layout/InfoCard.jsx";
import PageHero from "../../../components/layout/PageHero.jsx";

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
      <PageHero
        icon={LifeBuoy}
        title="Help / Support"
        description="Use this page for basic troubleshooting notes, safe testing reminders, and contact information for WalletFlow."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {supportItems.map((item) => (
          <InfoCard key={item.title} title={item.title} description={item.description} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard
          icon={ShieldCheck}
          iconClassName="text-brand-accent"
          title="Before reporting a bug"
          description="Try refreshing the page, signing out and back in, and confirming the active household. If the issue involves data, export a backup before making more changes."
        />

        <InfoCard
          icon={Wrench}
          title="Useful details to include"
          description="Include the page name, the button or action used, the selected month, the household, and any visible error message. Screenshots help when the issue is visual."
        />
      </div>

      <InfoCard icon={Mail} title="Contact">
        <p className="mt-3 text-sm text-text-muted">For feedback or support:</p>
        <a
          className="mt-1 inline-flex text-sm font-semibold text-brand-primary transition hover:text-brand-accent"
          href={`mailto:${appMetadata.supportEmail}`}
        >
          {appMetadata.supportEmail}
        </a>
      </InfoCard>
    </section>
  );
}
