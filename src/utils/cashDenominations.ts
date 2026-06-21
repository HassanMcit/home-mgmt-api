/**
 * cashDenominations.ts
 * Utility to update cash denominations when money is added or deducted.
 *
 * Egyptian denominations (largest to smallest):
 * 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 1, 0.5
 */

const DENOM_ORDER = [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 1, 0.5];

/**
 * Deducts `amount` from cash denominations using a greedy algorithm
 * (largest bills first). Returns the updated denominations object.
 * If the exact amount cannot be represented with current denominations,
 * the function does its best and returns null to signal imprecision.
 *
 * @param denominations  Current denominations { "2000": 10, "100": 5, ... }
 * @param amount         Amount to deduct (must be positive)
 * @returns              Updated denominations, or null if cannot deduct exactly
 */
export function deductFromDenominations(
  denominations: Record<string, number>,
  amount: number
): Record<string, number> | null {
  // Work with cents to avoid floating-point issues
  let remaining = Math.round(amount * 100);
  const updated = { ...denominations };

  for (const denom of DENOM_ORDER) {
    const denomCents = Math.round(denom * 100);
    const available = updated[String(denom)] || 0;
    if (available <= 0 || remaining <= 0) continue;

    const needed = Math.floor(remaining / denomCents);
    const use = Math.min(needed, available);
    if (use > 0) {
      updated[String(denom)] = available - use;
      remaining -= use * denomCents;
    }
  }

  // If remaining > 0, we couldn't deduct the full amount from existing denominations
  // This can happen e.g. you have only 2000s but need to pay 100
  // In this case, return null to signal that we should just trust the balance
  if (remaining > 0) return null;

  return updated;
}

/**
 * Adds `amount` to cash denominations using a greedy algorithm (largest bills first).
 * Distributes the incoming amount starting from the largest denomination.
 *
 * @param denominations  Current denominations
 * @param amount         Amount to add (must be positive)
 * @returns              Updated denominations
 */
export function addToDenominations(
  denominations: Record<string, number>,
  amount: number
): Record<string, number> {
  let remaining = Math.round(amount * 100);
  const updated = { ...denominations };

  for (const denom of DENOM_ORDER) {
    const denomCents = Math.round(denom * 100);
    if (remaining <= 0) break;
    const count = Math.floor(remaining / denomCents);
    if (count > 0) {
      updated[String(denom)] = (updated[String(denom)] || 0) + count;
      remaining -= count * denomCents;
    }
  }

  return updated;
}
