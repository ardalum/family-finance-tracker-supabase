import { LifeBuoy, ShieldCheck, Wrench } from "lucide-react";
import ContactCard from "../../../components/layout/ContactCard.jsx";
import InfoCard from "../../../components/layout/InfoCard.jsx";
import PageHero from "../../../components/layout/PageHero.jsx";
import {
  financeConceptGroups,
  helpSupportHero,
  supportDetailCards,
  supportGuidanceCards,
  troubleshootingChecklist,
} from "../helpSupportData.js";

const supportIconMap = {
  "shield-check": ShieldCheck,
  wrench: Wrench,
};

export default function HelpSupport() {
  return (
    <section className="grid gap-6">
      <PageHero
        icon={LifeBuoy}
        title={helpSupportHero.title}
        description={helpSupportHero.description}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {supportGuidanceCards.map((item) => (
          <InfoCard key={item.title} title={item.title} description={item.description} />
        ))}
      </div>

      <section className="grid gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-main">Spedger concepts guide</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-muted">
            Use this guide when a Dashboard number, payment flow, or account balance does not
            immediately make sense.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {financeConceptGroups.map((group) => (
            <InfoCard key={group.title} title={group.title}>
              <div className="mt-4 grid gap-3">
                {group.items.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-xl border border-app-border bg-app-background px-3 py-2"
                  >
                    <summary className="cursor-pointer text-sm font-semibold text-text-main">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm leading-6 text-text-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
            </InfoCard>
          ))}
        </div>
      </section>

      <InfoCard title="If a number looks wrong">
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-text-muted">
          {troubleshootingChecklist.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </InfoCard>

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
