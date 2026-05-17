export default function EmptyState({ title, description, className = "" }) {
  return (
    <div className={`p-8 text-center text-sm text-text-muted ${className}`}>
      {title ? <p className="font-semibold text-text-main">{title}</p> : null}
      {description ? <p className={title ? "mt-1" : ""}>{description}</p> : null}
    </div>
  );
}
