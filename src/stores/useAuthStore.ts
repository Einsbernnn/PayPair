import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from 'src/services/supabase'
import { signInWithGoogle, signOut } from 'src/services/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  async function init() {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null

    // Keep user in sync when session changes
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  async function loginWithGoogle() {
    loading.value = true
    try {
      await signInWithGoogle()
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await signOut()
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const isLoggedIn = computed(() => !!user.value)

  return { user, loading, isLoggedIn, init, loginWithGoogle, logout }
})
