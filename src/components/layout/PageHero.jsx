import Card from "../ui/Card.jsx";

export default function PageHero({ icon: Icon, iconSlot, eyebrow, title, description }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {iconSlot ?? (Icon ? <DefaultHeroIcon icon={Icon} /> : null)}
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={`${eyebrow ? "mt-2 " : ""}text-3xl font-semibold tracking-normal text-text-main`}
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-sm leading-6 text-text-muted">{description}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function DefaultHeroIcon({ icon: Icon }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm">
      <Icon size={26} strokeWidth={2.2} aria-hidden="true" />
    </div>
  );
}
