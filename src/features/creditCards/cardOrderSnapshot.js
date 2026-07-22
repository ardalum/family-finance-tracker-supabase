export function applyCardOrderSnapshot(cards, orderedCardIds) {
  if (!orderedCardIds?.length) return cards;

  const orderByCardId = new Map(orderedCardIds.map((cardId, index) => [cardId, index]));

  return [...cards].sort((a, b) => {
    const orderA = orderByCardId.get(a.id);
    const orderB = orderByCardId.get(b.id);

    if (orderA === undefined && orderB === undefined) return 0;
    if (orderA === undefined) return 1;
    if (orderB === undefined) return -1;
    return orderA - orderB;
  });
}
