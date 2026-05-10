import { updateAppData } from "../../lib/storage/appStorage";

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function normalizeCard(input) {
  return {
    name: input.name.trim(),
    url: input.url.trim(),
    network: input.network,
    owner: input.owner,
    ownerProfileId: input.ownerProfileId || null,
    lastFour: input.lastFour.trim(),
    creditLimit: Number(input.creditLimit) || 0,
    statementClosingDay: Number(input.statementClosingDay) || Number(input.dueDay) || 1,
    dueDay: Number(input.dueDay) || 1,
    isActive: input.isActive ?? true,
  };
}

export function addCreditCard(input) {
  return updateAppData((data) => {
    const timestamp = new Date().toISOString();
    return {
      ...data,
      creditCards: [
        ...data.creditCards,
        {
          id: createId("card"),
          ...normalizeCard(input),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    };
  });
}

export function updateCreditCard(cardId, input) {
  return updateAppData((data) => ({
    ...data,
    creditCards: data.creditCards.map((card) =>
      card.id === cardId
        ? {
            ...card,
            ...normalizeCard(input),
            updatedAt: new Date().toISOString(),
          }
        : card,
    ),
  }));
}

export function deleteCreditCard(cardId) {
  return updateAppData((data) => {
    const monthlyBalances = Object.fromEntries(
      Object.entries(data.monthlyBalances).map(([month, balances]) => [
        month,
        Object.fromEntries(
          Object.entries(balances ?? {}).filter(([currentCardId]) => currentCardId !== cardId),
        ),
      ]),
    );

    return {
      ...data,
      creditCards: data.creditCards.filter((card) => card.id !== cardId),
      monthlyBalances,
    };
  });
}

export function updateMonthlyBalance(monthKey, cardId, patch) {
  return updateAppData((data) => ({
    ...data,
    monthlyBalances: {
      ...data.monthlyBalances,
      [monthKey]: {
        ...(data.monthlyBalances[monthKey] ?? {}),
        [cardId]: {
          balance: 0,
          paid: false,
          ...(data.monthlyBalances[monthKey]?.[cardId] ?? {}),
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  }));
}

export function getOwnerCreditLimitTotal(cards, owner) {
  return cards
    .filter((card) => card.owner === owner && card.isActive)
    .reduce((sum, card) => sum + Number(card.creditLimit || 0), 0);
}

export function getMonthTotal(monthBalances) {
  return Object.values(monthBalances ?? {}).reduce(
    (sum, entry) => sum + Number(entry?.balance || 0),
    0,
  );
}
