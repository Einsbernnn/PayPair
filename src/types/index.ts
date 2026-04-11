export interface User {
  id: string;
  name: string;
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  status: 'active' | 'settled';
  created_at: string;
}

export interface SessionUser {
  session_id: string;
  user_id: string;
}

export interface Expense {
  id: string;
  session_id: string;
  description: string;
  amount: number;
  paid_by: string;
  category: 'food' | 'transport' | 'accommodation' | 'other';
  created_at: string;
}

export interface Split {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
}
