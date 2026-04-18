<script setup lang="ts">
  import { useAuthStore } from 'src/stores/useAuthStore';

  const authStore = useAuthStore();
</script>

<template>
  <q-page class="pp-auth">
    <div class="pp-auth__inner">
      <!-- Editorial hero -->
      <section class="pp-auth__hero">
        <div class="pp-auth__folio">Nº 01 · 2026</div>

        <div class="eyebrow">PairPay · Sign in</div>

        <h1 class="pp-auth__title display-xl">
          Keep the <em>receipts</em><br />
          honest.
        </h1>

        <p class="pp-auth__lede">
          Plan a date. Split a dinner. Track the Grab rides. PairPay does the bookkeeping so you and
          yours can argue about better things.
        </p>

        <div class="pp-auth__rule dotted-rule" />

        <div class="pp-auth__meta">
          <div>
            <div class="small-caps">A shared ledger</div>
            <div class="pp-auth__meta-val">for two, or a few</div>
          </div>
          <div>
            <div class="small-caps">Currency</div>
            <div class="pp-auth__meta-val">Philippine peso · ₱</div>
          </div>
        </div>
      </section>

      <!-- Sign-in card -->
      <aside class="pp-auth__card paper-card paper-card--raised">
        <div class="pp-auth__card-head">
          <div class="eyebrow" style="color: var(--ink-mute)">Welcome</div>
          <h2 class="display-md pp-auth__card-title">Sign in to continue</h2>
          <p class="pp-auth__card-sub">
            Choose a sign-in method below. We'll remember you on this device.
          </p>
        </div>

        <div class="pp-auth__providers">
          <q-btn
            unelevated
            no-caps
            class="pp-provider pp-provider--google"
            :loading="authStore.loading"
            @click="authStore.loginWithGoogle"
          >
            <span class="pp-provider__mark">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.75-6-6.13S8.69 5.94 12 5.94c1.88 0 3.14.8 3.86 1.49l2.64-2.54C16.88 3.34 14.67 2.4 12 2.4 6.72 2.4 2.5 6.65 2.5 12s4.22 9.6 9.5 9.6c5.48 0 9.1-3.85 9.1-9.28 0-.62-.07-1.1-.16-1.58H12z"
                />
                <path
                  fill="#34A853"
                  d="M3.88 7.35l3.18 2.34C7.93 8.07 9.8 6.94 12 6.94c1.88 0 3.14.8 3.86 1.49l2.64-2.54C16.88 4.33 14.67 3.4 12 3.4 7.93 3.4 4.46 5.95 3.88 7.35z"
                  opacity=".9"
                />
                <path
                  fill="#4285F4"
                  d="M21.1 12.32c0-.62-.07-1.1-.16-1.58H12v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-2.23 0-4.15-1.25-5.08-3.06l-3.22 2.5C5.28 20.58 8.39 22.6 12 22.6c5.48 0 9.1-3.85 9.1-9.28z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.73 14.18A9.5 9.5 0 0 1 3.3 12c0-.74.14-1.45.38-2.11L.5 7.35A11.6 11.6 0 0 0 0 12c0 1.82.43 3.54 1.18 5.06l2.55-2.88z"
                  opacity=".7"
                />
              </svg>
            </span>
            <span class="pp-provider__label">Continue with Google</span>
          </q-btn>

          <q-btn
            unelevated
            no-caps
            class="pp-provider pp-provider--github"
            :loading="authStore.loading"
            @click="authStore.loginWithGithub"
          >
            <span class="pp-provider__mark">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 .5C5.73.5.5 5.74.5 12.03c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.73 0c2.2-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.77.12 3.06.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.77 1.06.77 2.13 0 1.54-.01 2.77-.01 3.15 0 .31.2.67.8.56 4.56-1.52 7.85-5.82 7.85-10.9C23.5 5.74 18.27.5 12 .5z"
                />
              </svg>
            </span>
            <span class="pp-provider__label">Continue with GitHub</span>
          </q-btn>
        </div>

        <div class="pp-auth__fine">
          By signing in, you agree to let PairPay store your session data. Your receipts are yours.
        </div>
      </aside>
    </div>

    <!-- decorative gutter numeral -->
    <div
      class="pp-auth__gutter"
      aria-hidden="true"
    >
      &amp;
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
  .pp-auth {
    min-height: 100svh;
    padding: clamp(1.25rem, 4vw, 3rem);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .pp-auth__inner {
    width: 100%;
    max-width: 1120px;
    display: grid;
    gap: clamp(2rem, 4vw, 4rem);
    grid-template-columns: 1fr;
    position: relative;
    z-index: 1;

    @media (min-width: 900px) {
      grid-template-columns: 1.2fr 0.8fr;
      align-items: center;
    }
  }

  .pp-auth__hero {
    position: relative;
  }

  .pp-auth__folio {
    position: absolute;
    top: -1.5rem;
    right: 0;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--ink-mute);
    letter-spacing: 0.12em;

    @media (min-width: 900px) {
      top: 0;
      right: auto;
      left: -2.75rem;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }
  }

  .pp-auth__title {
    margin: 1rem 0 1.5rem;
    color: var(--ink);

    em {
      font-style: italic;
      color: var(--rouge);
      font-variation-settings:
        'opsz' 144,
        'SOFT' 70;
    }
  }

  .pp-auth__lede {
    font-family: var(--font-serif);
    font-size: clamp(1.05rem, 2vw, 1.25rem);
    line-height: 1.55;
    color: var(--ink-soft);
    max-width: 36ch;
    margin: 0;
    font-variation-settings:
      'opsz' 24,
      'SOFT' 50;
  }

  .pp-auth__rule {
    margin: 2rem 0 1.25rem;
    max-width: 22rem;
  }

  .pp-auth__meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    max-width: 26rem;
  }

  .pp-auth__meta-val {
    margin-top: 4px;
    font-family: var(--font-serif);
    font-size: 1rem;
    color: var(--ink);
    font-variation-settings:
      'opsz' 24,
      'SOFT' 20;
  }

  .pp-auth__card {
    padding: clamp(1.5rem, 3vw, 2.25rem);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: -1px;
      left: 1.5rem;
      right: 1.5rem;
      height: 3px;
      background: var(--rouge);
      border-radius: 0 0 3px 3px;
    }
  }

  .pp-auth__card-title {
    margin: 0.5rem 0 0.75rem;
    color: var(--ink);
  }

  .pp-auth__card-sub {
    margin: 0 0 1.5rem;
    color: var(--ink-mute);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .pp-auth__providers {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  :deep(.pp-provider) {
    width: 100%;
    justify-content: flex-start;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    font-family: var(--font-sans);
    font-size: 0.96rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    border: 1px solid var(--paper-edge);
    background: var(--paper);
    color: var(--ink);
    box-shadow: 0 1px 0 rgba(28, 20, 16, 0.04);
    transition:
      border-color 200ms var(--ease-ink),
      background 200ms var(--ease-ink),
      transform 160ms var(--ease-ink);

    .q-btn__content {
      width: 100%;
      justify-content: flex-start;
      gap: 0.85rem;
    }

    &:hover:not(.disabled) {
      border-color: var(--dust);
      background: var(--paper-deep);
      transform: translateY(-1px);
    }
  }

  :deep(.pp-provider--github) {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);

    &:hover:not(.disabled) {
      background: #2a1f18;
      border-color: #2a1f18;
    }
  }

  .pp-provider__mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--paper-deep);
  }

  :deep(.pp-provider--github) .pp-provider__mark {
    background: rgba(245, 239, 228, 0.08);
    color: var(--paper);
  }

  .pp-auth__fine {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--paper-edge);
    font-size: 0.78rem;
    color: var(--ink-mute);
    line-height: 1.5;
    font-style: italic;
    font-family: var(--font-serif);
    font-variation-settings:
      'opsz' 14,
      'SOFT' 20;
  }

  .pp-auth__gutter {
    position: absolute;
    bottom: -3rem;
    right: -2rem;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(14rem, 30vw, 26rem);
    line-height: 1;
    color: var(--rouge);
    opacity: 0.04;
    pointer-events: none;
    z-index: 0;
    font-variation-settings:
      'opsz' 144,
      'SOFT' 100;
  }
</style>
