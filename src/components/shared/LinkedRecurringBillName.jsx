import { Edit2, ReceiptText } from "lucide-react";

export default function LinkedRecurringBillName({
  billName,
  portalUrl,
  onEdit,
  className = "",
  showEditButton = true,
}) {
  const safeUrl = getSafeExternalUrl(portalUrl);
  const faviconUrl = getFaviconUrl(safeUrl);
  const titleName = String(billName || "Bill");
  const content = (
    <>
      {faviconUrl ? (
        <img
          className="h-4 w-4 shrink-0 rounded-sm"
          src={faviconUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <ReceiptText className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
      )}
      <span className="min-w-0 truncate">{titleName}</span>
    </>
  );

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      {safeUrl ? (
        <a
          className="inline-flex min-w-0 items-center gap-2 font-semibold text-gray-950 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-950"
          href={safeUrl}
          target="_blank"
          rel="noreferrer"
          title={`Open ${titleName} portal`}
        >
          {content}
        </a>
      ) : (
        <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-gray-950">
          {content}
        </span>
      )}
      {showEditButton && onEdit ? (
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          aria-label={`Edit ${titleName}`}
          onClick={onEdit}
        >
          <Edit2 size={14} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

function getSafeExternalUrl(url) {
  try {
    const parsedUrl = new URL(url);
    if (!["https:", "http:"].includes(parsedUrl.protocol)) return "";
    return parsedUrl.toString();
  } catch {
    return "";
  }
}

function getFaviconUrl(url) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`;
  } catch {
    return "";
  }
}
