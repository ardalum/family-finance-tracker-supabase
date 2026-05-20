function normalizeText(value) {
  return String(value ?? "").trim();
}

export function formatLinkedCardLabel(card = {}, options = {}) {
  const includeNetwork = options.includeNetwork !== false;
  const showMissingLastFour = Boolean(options.showMissingLastFour);
  const name = normalizeText(card.name) || "Unnamed card";
  const network = normalizeText(card.network);
  const lastFour = normalizeText(card.lastFour);

  if (lastFour) {
    if (includeNetwork && network) return `${name} • ${network} **** ${lastFour}`;
    return `${name} • **** ${lastFour}`;
  }

  if (showMissingLastFour) return `${name} • Last 4 missing`;
  return name;
}
