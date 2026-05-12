<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt: () => Promise<void>;
  }

  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
  const isStandalone = ref(false);
  const isIos = ref(false);
  const showIosSheet = ref(false);

  const visible = computed(() => {
    if (isStandalone.value) return false;
    return !!deferredPrompt.value || isIos.value;
  });

  function detectStandalone() {
    const mql = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    isStandalone.value = mql || iosStandalone;
  }

  function detectIos() {
    const ua = window.navigator.userAgent;
    isIos.value = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
  }

  function onBeforeInstallPrompt(event: Event) {
    event.preventDefault();
    deferredPrompt.value = event as BeforeInstallPromptEvent;
  }

  function onAppInstalled() {
    deferredPrompt.value = null;
    isStandalone.value = true;
  }

  async function handleClick() {
    if (deferredPrompt.value) {
      await deferredPrompt.value.prompt();
      await deferredPrompt.value.userChoice;
      deferredPrompt.value = null;
      return;
    }
    if (isIos.value) {
      showIosSheet.value = true;
    }
  }

  onMounted(() => {
    detectStandalone();
    detectIos();
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.removeEventListener('appinstalled', onAppInstalled);
  });
</script>

<template>
  <q-btn
    v-if="visible"
    flat
    dense
    round
    class="pp-install-btn"
    icon="ios_share"
    aria-label="Install PayPair"
    @click="handleClick"
  >
    <q-tooltip
      anchor="bottom middle"
      self="top middle"
      :offset="[0, 6]"
      class="pp-install-tooltip"
    >
      Install PayPair
    </q-tooltip>
  </q-btn>

  <q-dialog v-model="showIosSheet">
    <div class="pp-install-sheet">
      <div class="eyebrow pp-install-sheet__eyebrow">Add to Home Screen</div>
      <h3 class="pp-install-sheet__title">Install PayPair on your iPhone</h3>
      <p class="pp-install-sheet__lede">
        iOS doesn’t expose a one-tap installer, but it only takes three steps in Safari.
      </p>

      <ol class="pp-install-sheet__steps">
        <li>
          <span class="pp-install-sheet__num">1</span>
          <span>
            Tap the
            <q-icon name="ios_share" size="18px" class="pp-install-sheet__icon" />
            <strong> Share</strong> button in Safari’s toolbar.
          </span>
        </li>
        <li>
          <span class="pp-install-sheet__num">2</span>
          <span>
            Scroll and choose
            <strong>Add to Home Screen</strong>.
          </span>
        </li>
        <li>
          <span class="pp-install-sheet__num">3</span>
          <span>
            Confirm by tapping
            <strong>Add</strong> — PayPair will live on your home screen.
          </span>
        </li>
      </ol>

      <div class="dotted-rule pp-install-sheet__rule" aria-hidden="true" />

      <q-btn
        label="Got it"
        unelevated
        no-caps
        color="primary"
        class="pp-install-sheet__ok"
        @click="showIosSheet = false"
      />
    </div>
  </q-dialog>
</template>

<style lang="scss" scoped>
  .pp-install-btn {
    color: var(--ink-soft);

    &:hover {
      color: var(--rouge);
    }
  }

  .pp-install-sheet {
    min-width: min(380px, 92vw);
    max-width: 440px;
    padding: clamp(1.5rem, 3vw, 2rem);
    background: var(--paper-deep);
    border: 1px solid var(--paper-edge);
    border-radius: 16px;
    box-shadow: var(--shadow-paper);
  }

  .pp-install-sheet__eyebrow {
    color: var(--rouge);
    margin-bottom: 0.5rem;
  }

  .pp-install-sheet__title {
    margin: 0 0 0.6rem;
    font-family: var(--font-serif);
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--ink);
    font-variation-settings:
      'opsz' 32,
      'SOFT' 40;
  }

  .pp-install-sheet__lede {
    margin: 0 0 1.25rem;
    font-family: var(--font-serif);
    font-size: 0.98rem;
    line-height: 1.5;
    color: var(--ink-soft);
    font-variation-settings:
      'opsz' 18,
      'SOFT' 40;
  }

  .pp-install-sheet__steps {
    list-style: none;
    padding: 0;
    margin: 0 0 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;

    li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-family: var(--font-sans);
      font-size: 0.92rem;
      line-height: 1.45;
      color: var(--ink);
    }

    strong {
      font-weight: 600;
      color: var(--ink);
    }
  }

  .pp-install-sheet__num {
    flex: 0 0 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(165, 50, 30, 0.1);
    border: 1px solid rgba(165, 50, 30, 0.3);
    color: var(--rouge);
    font-family: var(--font-mono, var(--font-sans));
    font-size: 0.78rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pp-install-sheet__icon {
    vertical-align: -4px;
    margin: 0 2px;
    color: var(--rouge);
  }

  .pp-install-sheet__rule {
    margin: 0 0 1.1rem;
  }

  .pp-install-sheet__ok {
    width: 100%;
    padding: 0.7rem 1.1rem;
  }
</style>
