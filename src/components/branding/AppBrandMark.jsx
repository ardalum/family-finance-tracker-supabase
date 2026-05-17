import { WalletCards } from "lucide-react";

const brandMarkVariants = {
  sm: {
    containerClassName: "h-11 w-11",
    iconSize: 21,
    accentClassName: "bottom-2 right-2 h-1.5 w-5",
  },
  lg: {
    containerClassName: "h-14 w-14",
    iconSize: 26,
    accentClassName: "bottom-2 right-2 h-1.5 w-6",
  },
};

export default function AppBrandMark({ variant = "sm" }) {
  const config = brandMarkVariants[variant] ?? brandMarkVariants.sm;

  return (
    <div
      className={`relative flex ${config.containerClassName} shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm`}
    >
      <WalletCards size={config.iconSize} strokeWidth={2.2} aria-hidden="true" />
      <span className={`absolute ${config.accentClassName} rounded-full bg-brand-accent`} />
    </div>
  );
}
