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

    const error = route.query.error as string | undefined;
    const errorDesc = route.query.error_description as string | undefined;
    if (error) {
      console.error('[AuthCallback] OAuth error:', error, errorDesc);
      errorMessage.value = errorDesc ?? 'Authentication failed. Please try again.';
      return;
    }

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
  <q-page class="pp-callback">
    <div
      v-if="errorMessage"
      class="pp-callback__error"
    >
      <div class="pp-callback__seal">
        <q-icon
          name="error_outline"
          size="28px"
        />
      </div>
      <div class="eyebrow">Sign-in error</div>
      <h1 class="display-lg pp-callback__title">Something snagged.</h1>
      <p class="pp-callback__msg">{{ errorMessage }}</p>
      <q-btn
        unelevated
        no-caps
        icon="arrow_back"
        label="Back to sign in"
        color="primary"
        class="pp-callback__btn"
        to="/auth"
      />
    </div>

    <div
      v-else
      class="pp-callback__loading"
    >
      <div class="pp-callback__dots">
        <span class="pp-callback__dot pp-callback__dot--1" />
        <span class="pp-callback__dot pp-callback__dot--2" />
        <span class="pp-callback__dot pp-callback__dot--3" />
      </div>
      <div class="eyebrow">One moment</div>
      <h1 class="display-md pp-callback__title">Opening the ledger…</h1>
      <p class="pp-callback__msg">Finalising your sign-in. This takes just a second.</p>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
  .pp-callback {
    min-height: 100svh;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pp-callback__error,
  .pp-callback__loading {
    text-align: center;
    max-width: 28rem;
  }

  .pp-callback__seal {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(165, 50, 30, 0.1);
    color: var(--rouge);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
    border: 1px solid rgba(165, 50, 30, 0.3);
  }

  .pp-callback__title {
    margin: 0.65rem 0 0.75rem;
    color: var(--ink);
  }

  .pp-callback__msg {
    margin: 0 0 1.5rem;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--ink-mute);
    font-variation-settings:
      'opsz' 18,
      'SOFT' 50;
  }

  :deep(.pp-callback__btn) {
    padding: 0.8rem 1.35rem;
  }

  // Loading dots
  .pp-callback__dots {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  .pp-callback__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--rouge);
    animation: pp-callback-pulse 1.1s var(--ease-ink) infinite;
  }

  .pp-callback__dot--2 {
    animation-delay: 160ms;
    background: var(--gold);
  }
  .pp-callback__dot--3 {
    animation-delay: 320ms;
    background: var(--sage);
  }

  @keyframes pp-callback-pulse {
    0%,
    80%,
    100% {
      transform: scale(0.55);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
