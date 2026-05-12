import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { User } from '@supabase/supabase-js';
import { supabase } from 'src/services/supabase';
import {
  signInWithGoogle,
  signInWithGithub,
  signOut,
  signOutEverywhere,
  signUpWithPassword,
  signInWithPassword,
  updateProfile,
  updatePassword,
} from 'src/services/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  let initPromise: Promise<void> | null = null;

  function init() {
    if (initPromise) return initPromise;

    initPromise = new Promise<void>((resolve) => {
      console.log('[AuthStore] init: setting up onAuthStateChange listener');
      supabase.auth.onAuthStateChange((event, session) => {
        console.log(
          '[AuthStore] onAuthStateChange event:',
          event,
          'session:',
          !!session,
          'user:',
          session?.user?.email ?? 'null',
        );
        user.value = session?.user ?? null;

        if (event === 'INITIAL_SESSION') {
          console.log(
            '[AuthStore] INITIAL_SESSION received, user:',
            session?.user?.email ?? 'null',
          );
          initialized.value = true;
          resolve();
        }
      });

      setTimeout(() => {
        console.log(
          '[AuthStore] init timeout reached, initialized:',
          initialized.value,
          'user:',
          user.value?.email ?? 'null',
        );
        initialized.value = true;
        resolve();
      }, 5000);
    });

    return initPromise;
  }

  async function loginWithGoogle() {
    loading.value = true;
    try {
      await signInWithGoogle();
    } finally {
      loading.value = false;
    }
  }

  async function loginWithGithub() {
    loading.value = true;
    try {
      await signInWithGithub();
    } finally {
      loading.value = false;
    }
  }

  async function registerWithEmail(email: string, password: string, fullName?: string) {
    loading.value = true;
    try {
      return await signUpWithPassword(email, password, fullName);
    } finally {
      loading.value = false;
    }
  }

  async function loginWithEmail(email: string, password: string) {
    loading.value = true;
    try {
      return await signInWithPassword(email, password);
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    try {
      await signOut();
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function logoutEverywhere() {
    loading.value = true;
    try {
      await signOutEverywhere();
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function saveProfile(fullName: string) {
    loading.value = true;
    try {
      const result = await updateProfile(fullName);
      if (result.user) user.value = result.user;
      return result;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(newPassword: string) {
    loading.value = true;
    try {
      return await updatePassword(newPassword);
    } finally {
      loading.value = false;
    }
  }

  const isLoggedIn = computed(() => !!user.value);

  const fullName = computed(() => {
    const meta = user.value?.user_metadata as { full_name?: string; name?: string } | undefined;
    return meta?.full_name ?? meta?.name ?? '';
  });

  const email = computed(() => user.value?.email ?? '');

  const provider = computed<string>(() => {
    const app = user.value?.app_metadata as
      | { provider?: string; providers?: string[] }
      | undefined;
    return app?.provider ?? app?.providers?.[0] ?? 'email';
  });

  const memberSince = computed(() => user.value?.created_at ?? null);

  const isEmailUser = computed(() => {
    const app = user.value?.app_metadata as { providers?: string[] } | undefined;
    return (app?.providers ?? []).includes('email');
  });

  return {
    user,
    loading,
    initialized,
    isLoggedIn,
    fullName,
    email,
    provider,
    memberSince,
    isEmailUser,
    init,
    loginWithGoogle,
    loginWithGithub,
    registerWithEmail,
    loginWithEmail,
    logout,
    logoutEverywhere,
    saveProfile,
    changePassword,
  };
});
