function normalizeText(value) {
  return String(value ?? "").trim();
}

const CARD_LABEL_SEPARATOR = " \u2022 ";

export function formatLinkedCardLabel(card = {}, options = {}) {
  const includeNetwork = options.includeNetwork !== false;
  const includeLastFour = options.includeLastFour !== false;
  const showMissingLastFour = Boolean(options.showMissingLastFour);
  const name = normalizeText(card.name) || "Unnamed card";
  const network = normalizeText(card.network);
  const lastFour = normalizeText(card.lastFour);

  if (includeLastFour && lastFour) {
    if (includeNetwork && network)
      return `${name}${CARD_LABEL_SEPARATOR}${network} **** ${lastFour}`;
    return `${name}${CARD_LABEL_SEPARATOR}**** ${lastFour}`;
  }

  if (includeNetwork && network) {
    return `${name}${CARD_LABEL_SEPARATOR}${network}`;
  }

  if (includeLastFour && showMissingLastFour) return `${name}${CARD_LABEL_SEPARATOR}Last 4 missing`;
  return name;
}
