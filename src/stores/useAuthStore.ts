import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { User } from '@supabase/supabase-js';
import { supabase } from 'src/services/supabase';
import {
  signInWithGoogle,
  signInWithGithub,
  signOut,
  signUpWithPassword,
  signInWithPassword,
} from 'src/services/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  let initPromise: Promise<void> | null = null;

  function init() {
    // Only run init once; return the same promise if called again
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

        // INITIAL_SESSION fires after Supabase finishes processing URL tokens
        if (event === 'INITIAL_SESSION') {
          console.log(
            '[AuthStore] INITIAL_SESSION received, user:',
            session?.user?.email ?? 'null',
          );
          initialized.value = true;
          resolve();
        }
      });

      // Safety timeout so the app doesn't hang if the event never fires
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

  const isLoggedIn = computed(() => !!user.value);

  return {
    user,
    loading,
    initialized,
    isLoggedIn,
    init,
    loginWithGoogle,
    loginWithGithub,
    registerWithEmail,
    loginWithEmail,
    logout,
  };
});
