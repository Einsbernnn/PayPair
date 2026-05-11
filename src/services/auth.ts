import { supabase } from 'src/services/supabase';

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw new Error(error.message);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function signInWithGithub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`,
    },
  });

  if (error) throw new Error(error.message);
}

export async function signUpWithPassword(email: string, password: string, fullName?: string) {
  const emailRedirectTo = `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`;
  const options = fullName
    ? { emailRedirectTo, data: { full_name: fullName } }
    : { emailRedirectTo };
  const { data, error } = await supabase.auth.signUp({ email, password, options });
  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}
