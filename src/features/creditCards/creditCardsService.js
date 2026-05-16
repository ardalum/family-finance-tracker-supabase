import { normalizeCardFormInput } from "./cardFormUtils.js";
import { getRowStatus } from "./creditCardStatus.js";
import { updateAppData } from "../../lib/storage/appStorage.js";

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
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
          ...normalizeCardFormInput(input),
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
            ...normalizeCardFormInput(input),
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

export function getMonthlyBalanceSummary(cards, monthBalances, selectedMonth) {
  return cards.reduce(
    (summary, card) => {
      const entry = monthBalances?.[card.id];
      const status = getRowStatus(card, selectedMonth, entry);
      const balance = Number(entry?.balance || 0);

      return {
        statementBalance: summary.statementBalance + balance,
        unpaidBalance: summary.unpaidBalance + (entry?.paid ? 0 : balance),
        checkedNoBalanceCount:
          summary.checkedNoBalanceCount + (status.isCheckedNoBalance ? 1 : 0),
        notCheckedCount: summary.notCheckedCount + (status.isNotChecked ? 1 : 0),
      };
    },
    {
      statementBalance: 0,
      unpaidBalance: 0,
      checkedNoBalanceCount: 0,
      notCheckedCount: 0,
    },
  );
}
