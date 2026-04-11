<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { useSessionStore } from 'src/stores/useSessionStore';
  import SessionCard from 'src/components/SessionCard.vue';
  import EmptyState from 'src/components/EmptyState.vue';
  import LoadingSpinner from 'src/components/LoadingSpinner.vue';

  const $q = useQuasar();
  const sessionStore = useSessionStore();

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
  <q-page padding>
    <div class="text-h5 q-mb-md">Your Sessions</div>

    <LoadingSpinner v-if="sessionStore.loading" />

    <EmptyState
      v-else-if="sessionStore.sessions.length === 0"
      icon="event_note"
      message="No sessions yet. Create one to get started!"
    />

    <div
      v-else
      class="q-gutter-md"
    >
      <SessionCard
        v-for="session in sessionStore.sessions"
        :key="session.id"
        :session="session"
        @delete="handleDelete"
      />
    </div>
  </q-page>
</template>
