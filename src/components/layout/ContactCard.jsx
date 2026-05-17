import { Mail } from "lucide-react";
import { appMetadata } from "../../app/appMetadata.js";
import InfoCard from "./InfoCard.jsx";

export default function ContactCard({ title = "Contact", prompt = "For feedback or support:" }) {
  return (
    <InfoCard icon={Mail} title={title}>
      <p className="mt-3 text-sm text-text-muted">{prompt}</p>
      <a
        className="mt-1 inline-flex text-sm font-semibold text-brand-primary transition hover:text-brand-accent"
        href={`mailto:${appMetadata.supportEmail}`}
      >
        {appMetadata.supportEmail}
      </a>
    </InfoCard>
  );
}
