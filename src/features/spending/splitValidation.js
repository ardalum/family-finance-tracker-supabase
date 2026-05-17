export function validateSplitReplacementInput(input) {
  if (!input?.splitMode) return;

  const splits = Array.isArray(input.splits) ? input.splits : [];
  if (splits.length === 0) {
    throw new Error("Split transactions must include at least one split row.");
  }

  const transactionAmount = Number(input.amount) || 0;
  const splitTotal = splits.reduce((sum, split) => sum + (Number(split.amount) || 0), 0);
  const hasInvalidSplit = splits.some((split) => (Number(split.amount) || 0) <= 0);
  if (hasInvalidSplit) {
    throw new Error("Split amounts must be positive.");
  }

  if (Math.round(transactionAmount * 100) !== Math.round(splitTotal * 100)) {
    throw new Error("Split amounts must equal the transaction amount.");
  }
}
