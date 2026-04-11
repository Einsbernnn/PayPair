import { supabase } from 'src/services/supabase';
import type { Session, User } from 'src/types';

export async function createSession(title: string, date: string): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ title, date, status: 'active' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchSessionById(id: string): Promise<Session> {
  const { data, error } = await supabase.from('sessions').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSessionStatus(id: string, status: 'active' | 'settled'): Promise<void> {
  const { error } = await supabase.from('sessions').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addParticipant(sessionId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('session_users')
    .insert({ session_id: sessionId, user_id: userId });
  if (error) throw new Error(error.message);
}

export async function removeParticipant(sessionId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('session_users')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function fetchParticipants(sessionId: string): Promise<User[]> {
  const { data: links, error: linkError } = await supabase
    .from('session_users')
    .select('user_id')
    .eq('session_id', sessionId);
  if (linkError) throw new Error(linkError.message);
  if (!links || links.length === 0) return [];

  const userIds = links.map((l) => l.user_id as string);
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds);
  if (userError) throw new Error(userError.message);
  return users ?? [];
}
