import { LifeBuoy, ShieldCheck, Wrench } from "lucide-react";
import ContactCard from "../../../components/layout/ContactCard.jsx";
import InfoCard from "../../../components/layout/InfoCard.jsx";
import PageHero from "../../../components/layout/PageHero.jsx";
import { supportDetailCards, supportGuidanceCards } from "../helpSupportData.js";

const supportIconMap = {
  "shield-check": ShieldCheck,
  wrench: Wrench,
};

export default function HelpSupport() {
  return (
    <section className="grid gap-6">
      <PageHero
        icon={LifeBuoy}
        title="Help / Support"
        description="Use this page for basic troubleshooting notes, safe testing reminders, and contact information for WalletFlow."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {supportGuidanceCards.map((item) => (
          <InfoCard key={item.title} title={item.title} description={item.description} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {supportDetailCards.map((item) => (
          <InfoCard
            key={item.title}
            icon={supportIconMap[item.iconName]}
            iconClassName={item.iconClassName}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>

      <ContactCard />
    </section>
  );
}
