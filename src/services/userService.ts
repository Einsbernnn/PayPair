import { supabase } from 'src/services/supabase';
import type { User } from 'src/types';

export async function createUser(name: string): Promise<User> {
  const { data, error } = await supabase.from('users').insert({ name }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*').order('created_at');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchUserById(id: string): Promise<User> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}
