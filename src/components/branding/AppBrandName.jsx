import { appMetadata } from "../../app/appMetadata.js";

export default function AppBrandName() {
  return (
    <span aria-label={appMetadata.name}>
      <span className="text-brand-primary">Sped</span>
      <span className="text-brand-accent">ger</span>
    </span>
  );
}
