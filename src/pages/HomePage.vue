<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import { useQuasar } from 'quasar';
  import { useSessionStore } from 'src/stores/useSessionStore';
  import SessionCard from 'src/components/SessionCard.vue';
  import EmptyState from 'src/components/EmptyState.vue';
  import LoadingSpinner from 'src/components/LoadingSpinner.vue';

  const $q = useQuasar();
  const sessionStore = useSessionStore();

  const activeCount = computed(
    () => sessionStore.sessions.filter((s) => s.status === 'active').length,
  );
  const totalCount = computed(() => sessionStore.sessions.length);

  onMounted(async () => {
    await sessionStore.fetchSessions();
  });

  async function handleDelete(id: string) {
    try {
      await sessionStore.deleteSession(id);
      $q.notify({ type: 'positive', message: 'Session deleted.' });
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to delete session.' });
    }
  }
</script>

<template>
  <q-page class="pp-home">
    <header class="pp-home__header">
      <div>
        <div class="eyebrow">Nº 02 · Sessions</div>
        <h1 class="display-lg pp-home__title">Your shared ledger</h1>
        <p class="pp-home__sub">
          <template v-if="totalCount === 0">
            Every evening out, every split bill, every Grab fare — kept in one place.
          </template>
          <template v-else>
            <span class="pp-home__count">{{ totalCount }}</span>
            {{ totalCount === 1 ? 'session' : 'sessions' }} in the book<template
              v-if="activeCount > 0"
            >
              · <span class="text-rouge">{{ activeCount }} active</span>
            </template>.
          </template>
        </p>
      </div>
      <q-btn
        unelevated
        no-caps
        icon="add"
        label="New session"
        color="primary"
        class="pp-home__cta"
        to="/sessions/new"
      />
    </header>

    <div
      class="dotted-rule pp-home__divider"
      aria-hidden="true"
    />

    <LoadingSpinner v-if="sessionStore.loading" />

    <EmptyState
      v-else-if="sessionStore.sessions.length === 0"
      icon="event_note"
      title="An empty page"
      message="Create your first session to start tracking shared expenses."
      action-label="Create a session"
      action-to="/sessions/new"
    />

    <div
      v-else
      class="pp-home__list"
    >
      <div
        v-for="(session, i) in sessionStore.sessions"
        :key="session.id"
        :class="['pp-rise', `pp-rise-${Math.min(i + 1, 12)}`]"
      >
        <SessionCard
          :session="session"
          @delete="handleDelete"
        />
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
  .pp-home {
    padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 2rem) 6rem;
    max-width: 880px;
    margin: 0 auto;
  }

  .pp-home__header {
    display: flex;
    align-items: flex-end;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .pp-home__title {
    margin: 0.65rem 0 0.5rem;
    color: var(--ink);
  }

  .pp-home__sub {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.05rem;
    line-height: 1.5;
    color: var(--ink-soft);
    max-width: 46ch;
    font-variation-settings:
      'opsz' 20,
      'SOFT' 30;
  }

  .pp-home__count {
    font-weight: 500;
    color: var(--ink);
  }

  :deep(.pp-home__cta) {
    font-family: var(--font-sans);
    font-weight: 500;
    padding: 0.7rem 1.1rem;
  }

  .pp-home__divider {
    margin: 1.75rem 0 1.25rem;
  }

  .pp-home__list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
</style>
