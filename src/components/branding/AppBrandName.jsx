import { appMetadata } from "../../app/appMetadata.js";

export default function AppBrandName() {
  return (
    <span aria-label={appMetadata.name}>
      <span className="text-brand-primary">Wallet</span>
      <span className="text-brand-accent">Flow</span>
    </span>
  );
}
