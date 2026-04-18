<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useAuthStore } from 'src/stores/useAuthStore';
  import { useSessionStore } from 'src/stores/useSessionStore';

  const authStore = useAuthStore();
  const sessionStore = useSessionStore();

  const greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 5) return 'Still up';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    if (h < 22) return 'Good evening';
    return 'Hello there';
  });

  const firstName = computed(() => {
    const meta = authStore.user?.user_metadata as
      | { full_name?: string; name?: string }
      | undefined;
    const name = meta?.full_name ?? meta?.name ?? authStore.user?.email?.split('@')[0] ?? '';
    return name.split(/\s+/)[0] ?? '';
  });

  const today = computed(() =>
    new Date().toLocaleDateString('en-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    }),
  );

  const activeCount = computed(
    () => sessionStore.sessions.filter((s) => s.status === 'active').length,
  );
  const totalCount = computed(() => sessionStore.sessions.length);

  onMounted(async () => {
    if (sessionStore.sessions.length === 0) {
      await sessionStore.fetchSessions();
    }
  });
</script>

<template>
  <q-page class="pp-index">
    <div class="pp-index__folio">
      <span>{{ today }}</span>
      <span class="pp-index__folio-num">Nº 01</span>
    </div>

    <section class="pp-index__hero">
      <div class="eyebrow">Today's ledger</div>
      <h1 class="display-xl pp-index__greeting">
        {{ greeting }},<br />
        <em>{{ firstName || 'friend' }}</em
        >.
      </h1>
      <p class="pp-index__lede">
        A quiet place to plan dates, split bills, and keep the peace between friends. Every session
        starts with a title and a date.
      </p>
    </section>

    <div
      class="dotted-rule pp-index__rule"
      aria-hidden="true"
    />

    <section class="pp-index__grid">
      <article class="pp-index__stat">
        <div class="small-caps">In the book</div>
        <div class="pp-index__stat-num">{{ totalCount }}</div>
        <div class="pp-index__stat-label">
          {{ totalCount === 1 ? 'session' : 'sessions' }} total
        </div>
      </article>
      <article class="pp-index__stat pp-index__stat--accent">
        <div class="small-caps">Currently open</div>
        <div class="pp-index__stat-num">{{ activeCount }}</div>
        <div class="pp-index__stat-label">active</div>
      </article>
      <article class="pp-index__stat">
        <div class="small-caps">Currency</div>
        <div class="pp-index__stat-num">₱</div>
        <div class="pp-index__stat-label">Philippine peso</div>
      </article>
    </section>

    <div class="pp-index__actions">
      <q-btn
        unelevated
        no-caps
        icon="receipt_long"
        label="Go to sessions"
        color="primary"
        class="pp-index__primary"
        to="/sessions"
      />
      <q-btn
        unelevated
        no-caps
        icon-right="arrow_forward"
        label="Start a new session"
        class="btn-ghost pp-index__ghost"
        to="/sessions/new"
      />
    </div>

    <blockquote class="pp-index__quote">
      <span class="pp-index__quote-mark">&ldquo;</span>
      <span class="pp-index__quote-body">
        The best friendships survive a split dinner bill &mdash; because no one has to remember who
        paid.
      </span>
    </blockquote>
  </q-page>
</template>

<style lang="scss" scoped>
  .pp-index {
    padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 2rem) 6rem;
    max-width: 820px;
    margin: 0 auto;
    position: relative;
  }

  .pp-index__folio {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    color: var(--ink-mute);
    margin-bottom: 1.5rem;
    text-transform: uppercase;
  }

  .pp-index__folio-num {
    color: var(--rouge);
  }

  .pp-index__hero {
    position: relative;
  }

  .pp-index__greeting {
    margin: 0.65rem 0 1.25rem;
    color: var(--ink);

    em {
      font-style: italic;
      color: var(--rouge);
      font-variation-settings:
        'opsz' 144,
        'SOFT' 80;
    }
  }

  .pp-index__lede {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.05rem, 2vw, 1.2rem);
    line-height: 1.55;
    color: var(--ink-soft);
    max-width: 44ch;
    font-variation-settings:
      'opsz' 20,
      'SOFT' 40;
  }

  .pp-index__rule {
    margin: 2rem 0 1.5rem;
  }

  .pp-index__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.85rem;

    @media (max-width: 520px) {
      grid-template-columns: 1fr;
    }
  }

  .pp-index__stat {
    padding: 1rem 1.15rem;
    background: var(--paper-deep);
    border: 1px solid var(--paper-edge);
    border-radius: 12px;

    .small-caps {
      color: var(--ink-mute);
    }
  }

  .pp-index__stat--accent {
    background: linear-gradient(135deg, rgba(165, 50, 30, 0.05), rgba(232, 203, 168, 0.2));
    border-color: rgba(165, 50, 30, 0.18);

    .pp-index__stat-num {
      color: var(--rouge);
    }
  }

  .pp-index__stat-num {
    margin-top: 0.65rem;
    font-family: var(--font-serif);
    font-size: 2.5rem;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--ink);
    font-variation-settings:
      'opsz' 96,
      'SOFT' 30;
  }

  .pp-index__stat-label {
    margin-top: 0.35rem;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    color: var(--ink-mute);
  }

  .pp-index__actions {
    margin-top: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  :deep(.pp-index__primary) {
    font-family: var(--font-sans);
    padding: 0.85rem 1.35rem;
  }

  :deep(.pp-index__ghost) {
    font-family: var(--font-sans);
    padding: 0.85rem 1.35rem;
  }

  .pp-index__quote {
    margin: 3rem 0 0;
    padding: 1.5rem 1.5rem 1.5rem 2.75rem;
    border-left: 2px solid var(--rouge);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(1.1rem, 2.2vw, 1.35rem);
    line-height: 1.5;
    color: var(--ink-soft);
    position: relative;
    font-variation-settings:
      'opsz' 48,
      'SOFT' 60;
  }

  .pp-index__quote-mark {
    position: absolute;
    top: -0.75rem;
    left: 1rem;
    font-size: 4rem;
    color: var(--rouge);
    line-height: 1;
    opacity: 0.6;
  }

  .pp-index__quote-body {
    display: block;
    padding-top: 0.25rem;
  }
</style>
