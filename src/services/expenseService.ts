import { supabase } from 'src/services/supabase';
import type { Expense, Split } from 'src/types';
import type { ExpenseInput } from 'src/types/schemas';
import { calculateEqualSplits } from 'src/utils/splitCalculator';

export async function addExpense(input: ExpenseInput, participantIds: string[]): Promise<Expense> {
  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      session_id: input.session_id,
      description: input.description,
      amount: input.amount,
      paid_by: input.paid_by,
      category: input.category,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const splits = calculateEqualSplits(input.amount, participantIds);
  const splitRows = Object.entries(splits).map(([userId, amount]) => ({
    expense_id: expense.id,
    user_id: userId,
    amount,
  }));

  const { error: splitError } = await supabase.from('splits').insert(splitRows);
  if (splitError) throw new Error(splitError.message);

  return expense;
}

export async function fetchExpensesBySession(sessionId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchSplitsBySession(sessionId: string): Promise<Split[]> {
  const { data, error } = await supabase
    .from('splits')
    .select('*, expenses!inner(session_id)')
    .eq('expenses.session_id', sessionId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    expense_id: row.expense_id as string,
    user_id: row.user_id as string,
    amount: row.amount as number,
  }));
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const { error: splitError } = await supabase.from('splits').delete().eq('expense_id', expenseId);
  if (splitError) throw new Error(splitError.message);

  const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
  if (error) throw new Error(error.message);
}
