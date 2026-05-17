import { ShieldAlert } from "lucide-react";
import { appMetadata } from "../../../app/appMetadata.js";
import { AppBrandMark, AppBrandName } from "../../../components/branding/index.js";
import CheckList from "../../../components/layout/CheckList.jsx";
import ContactCard from "../../../components/layout/ContactCard.jsx";
import InfoCard from "../../../components/layout/InfoCard.jsx";
import PageHero from "../../../components/layout/PageHero.jsx";
import Card from "../../../components/ui/Card.jsx";
import {
  aboutDisclaimerParagraphs,
  aboutIntroDescription,
  aboutProductDetailRows,
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
          <CheckList items={aboutTrackingItems} />
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold text-text-main">Product Details</h3>
          <dl className="mt-4 grid gap-4 text-sm">
            {aboutProductDetailRows.map((row) => (
              <div key={row.valueKey}>
                <dt className="font-medium text-text-muted">{row.label}</dt>
                <dd className="mt-1 font-semibold text-text-main">{appMetadata[row.valueKey]}</dd>
              </div>
            ))}
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
