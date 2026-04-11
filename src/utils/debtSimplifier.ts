import type { Balance } from 'src/utils/balanceCalculator';

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export function simplifyDebts(balances: Balance[]): Transaction[] {
  const transactions: Transaction[] = [];

  const creditors = balances.filter((b) => b.net > 0).map((b) => ({ ...b }));
  const debtors = balances.filter((b) => b.net < 0).map((b) => ({ ...b }));

  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]!;
    const creditor = creditors[j]!;
    const amount = parseFloat(Math.min(Math.abs(debtor.net), creditor.net).toFixed(2));

    transactions.push({ from: debtor.userId, to: creditor.userId, amount });

    debtor.net += amount;
    creditor.net -= amount;

    if (Math.abs(debtor.net) < 0.01) i++;
    if (Math.abs(creditor.net) < 0.01) j++;
  }

  return transactions;
}
