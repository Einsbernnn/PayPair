import { supabase } from 'src/services/supabase';
import type { Session, Expense, Split, User } from 'src/types';

export interface ExportBundle {
  exported_at: string;
  app: 'PayPair';
  version: string;
  sessions: Session[];
  expenses: Expense[];
  splits: Split[];
  users: User[];
}

export async function fetchUserData(version: string): Promise<ExportBundle> {
  const [sessionsRes, expensesRes, splitsRes, usersRes] = await Promise.all([
    supabase.from('sessions').select('*').order('created_at'),
    supabase.from('expenses').select('*').order('created_at'),
    supabase.from('splits').select('*'),
    supabase.from('users').select('*').order('created_at'),
  ]);

  if (sessionsRes.error) throw new Error(sessionsRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);
  if (splitsRes.error) throw new Error(splitsRes.error.message);
  if (usersRes.error) throw new Error(usersRes.error.message);

  return {
    exported_at: new Date().toISOString(),
    app: 'PayPair',
    version,
    sessions: sessionsRes.data ?? [],
    expenses: expensesRes.data ?? [],
    splits: splitsRes.data ?? [],
    users: usersRes.data ?? [],
  };
}

export function downloadAsJson(bundle: ExportBundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `paypair-export-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
