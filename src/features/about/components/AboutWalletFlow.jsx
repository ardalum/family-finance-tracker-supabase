import { CheckCircle2, ShieldAlert } from "lucide-react";
import { appMetadata } from "../../../app/appMetadata.js";
import { AppBrandMark, AppBrandName } from "../../../components/branding/index.js";
import ContactCard from "../../../components/layout/ContactCard.jsx";
import InfoCard from "../../../components/layout/InfoCard.jsx";
import PageHero from "../../../components/layout/PageHero.jsx";
import Card from "../../../components/ui/Card.jsx";
import {
  aboutDisclaimerParagraphs,
  aboutIntroDescription,
  aboutTrackingItems,
} from "../aboutPageData.js";

function AboutIntroDescription() {
  return (
    <>
      <span className="block text-base font-medium text-text-soft">{appMetadata.tagline}</span>
      <span className="mt-4 block">{aboutIntroDescription}</span>
    </>
  );
}

export default function AboutWalletFlow() {
  return (
    <section className="grid gap-6">
      <PageHero
        iconSlot={<AppBrandMark variant="lg" />}
        title={<AppBrandName />}
        description={<AboutIntroDescription />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-text-main">What WalletFlow Helps Track</h3>
          <ul className="mt-4 grid gap-3">
            {aboutTrackingItems.map((item) => (
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
              <dd className="mt-1 font-semibold text-text-main">{appMetadata.creatorName}</dd>
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

      <InfoCard icon={ShieldAlert} iconClassName="text-status-warning" title="Disclaimer">
        {aboutDisclaimerParagraphs.map((paragraph) => (
          <p key={paragraph} className="mt-3 text-sm leading-6 text-text-muted">
            {paragraph}
          </p>
        ))}
      </InfoCard>

      <ContactCard title="Support / Contact" prompt="For questions, feedback, or support:" />
    </section>
  );
}
