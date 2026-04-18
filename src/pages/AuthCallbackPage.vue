<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from 'src/stores/useAuthStore';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const errorMessage = ref('');

  onMounted(async () => {
    console.log('[AuthCallback] mounted, URL:', window.location.href);
    console.log('[AuthCallback] route.query:', JSON.stringify(route.query));

    // Check if Supabase returned an error from the OAuth provider
    const error = route.query.error as string | undefined;
    const errorDesc = route.query.error_description as string | undefined;
    if (error) {
      console.error('[AuthCallback] OAuth error:', error, errorDesc);
      errorMessage.value = errorDesc ?? 'Authentication failed. Please try again.';
      return;
    }

    // Wait for auth to fully initialize
    await authStore.init();

    console.log('[AuthCallback] after init, isLoggedIn:', authStore.isLoggedIn);

    if (authStore.isLoggedIn) {
      const redirect = (route.query.redirect as string) || '/sessions';
      await router.push(redirect);
    } else {
      errorMessage.value = 'Sign-in failed. Please try again.';
    }
  });
</script>

<template>
  <q-page class="flex flex-center">
    <div
      v-if="errorMessage"
      class="text-center q-pa-lg"
    >
      <q-icon
        name="error_outline"
        size="64px"
        color="negative"
      />
      <div class="text-h6 q-mt-md">Sign-in Error</div>
      <p class="text-body1 text-grey-7 q-mt-sm">{{ errorMessage }}</p>
      <q-btn
        label="Back to Sign In"
        color="primary"
        to="/auth"
        class="q-mt-md"
      />
    </div>
    <q-spinner
      v-else
      color="primary"
      size="50px"
    />
  </q-page>
</template>
