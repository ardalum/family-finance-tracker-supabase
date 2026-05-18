const iconVariantClasses = {
  blue: "bg-blue-50 text-blue-600 ring-blue-200",
  violet: "bg-violet-50 text-violet-600 ring-violet-200",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  orange: "bg-orange-50 text-orange-600 ring-orange-200",
  rose: "bg-rose-50 text-rose-600 ring-rose-200",
  cyan: "bg-cyan-50 text-cyan-600 ring-cyan-200",
  teal: "bg-teal-50 text-teal-600 ring-teal-200",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-200",
  purple: "bg-purple-50 text-purple-600 ring-purple-200",
  green: "bg-green-50 text-green-600 ring-green-200",
  lime: "bg-lime-50 text-lime-700 ring-lime-200",
  sky: "bg-sky-50 text-sky-600 ring-sky-200",
  red: "bg-red-50 text-red-600 ring-red-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

const plainIconVariantClasses = {
  blue: "text-blue-600",
  violet: "text-violet-600",
  emerald: "text-emerald-600",
  orange: "text-orange-600",
  rose: "text-rose-600",
  cyan: "text-cyan-600",
  teal: "text-teal-600",
  indigo: "text-indigo-600",
  purple: "text-purple-600",
  green: "text-green-600",
  lime: "text-lime-700",
  sky: "text-sky-600",
  red: "text-red-600",
  slate: "text-slate-700",
  amber: "text-amber-700",
  neutral: "text-zinc-700",
};

function normalizeVariant(variant) {
  return iconVariantClasses[variant] ? variant : "neutral";
}

export default function FeatureIcon({
  icon: Icon,
  variant = "neutral",
  size = 18,
  mode = "badge",
  className = "",
  iconClassName = "",
  active = false,
}) {
  const normalizedVariant = normalizeVariant(variant);
  const badgeClass = iconVariantClasses[normalizedVariant];
  const plainClass = plainIconVariantClasses[normalizedVariant];

  if (mode === "plain") {
    return (
      <Icon
        size={size}
        className={`${active ? "text-white" : plainClass} ${iconClassName}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${badgeClass} ${className}`}
    >
      <Icon size={size} className={iconClassName} aria-hidden="true" />
    </span>
  );
}
