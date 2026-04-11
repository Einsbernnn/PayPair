import type { Expense, Split } from 'src/types';

export interface Balance {
  userId: string;
  paid: number;
  owed: number;
  net: number;
}

export function computeBalances(expenses: Expense[], splits: Split[]): Balance[] {
  const balanceMap: Record<string, Balance> = {};

  for (const expense of expenses) {
    if (!balanceMap[expense.paid_by]) {
      balanceMap[expense.paid_by] = { userId: expense.paid_by, paid: 0, owed: 0, net: 0 };
    }
    balanceMap[expense.paid_by]!.paid += expense.amount;
  }

  for (const split of splits) {
    if (!balanceMap[split.user_id]) {
      balanceMap[split.user_id] = { userId: split.user_id, paid: 0, owed: 0, net: 0 };
    }
    balanceMap[split.user_id]!.owed += split.amount;
  }

  return Object.values(balanceMap).map((b) => ({
    ...b,
    net: parseFloat((b.paid - b.owed).toFixed(2)),
  }));
}
