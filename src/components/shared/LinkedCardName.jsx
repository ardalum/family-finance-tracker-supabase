import { formatLinkedCardLabel } from "../../features/creditCards/cardDisplayUtils.js";

export default function LinkedCardName({ card, className = "" }) {
  const safeUrl = getSafeExternalUrl(card.url);
  const faviconUrl = getFaviconUrl(safeUrl);
  const label = formatLinkedCardLabel(card);
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
      ) : null}
      <span className="min-w-0 truncate">{label}</span>
    </>
  );

  if (!safeUrl) {
    return (
      <span
        className={`inline-flex min-w-0 items-center gap-2 font-semibold text-gray-950 ${className}`}
      >
        {content}
      </span>
    );
  }

  return (
    <a
      className={`inline-flex min-w-0 items-center gap-2 font-semibold text-gray-950 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-950 ${className}`}
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
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
