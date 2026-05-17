import Card from "../ui/Card.jsx";

export default function InfoCard({
  icon: Icon,
  iconClassName = "text-brand-secondary",
  title,
  description,
  children,
}) {
  const content = (
    <>
      <h3 className="text-lg font-semibold text-text-main">{title}</h3>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-text-muted">{description}</p>
      ) : null}
      {children}
    </>
  );

  return (
    <Card className="p-5">
      {Icon ? (
        <div className="flex gap-3">
          <Icon size={20} className={`mt-0.5 shrink-0 ${iconClassName}`} aria-hidden="true" />
          <div>{content}</div>
        </div>
      ) : (
        content
      )}
    </Card>
  );
}
