<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import type { Session } from 'src/types';
  import ConfirmDialog from 'src/components/ConfirmDialog.vue';

  const props = defineProps<{
    session: Session;
  }>();

  const emit = defineEmits<{
    delete: [id: string];
  }>();

  const router = useRouter();
  const showDeleteDialog = ref(false);

  const dateObj = computed(() => new Date(props.session.date));
  const day = computed(() =>
    dateObj.value.toLocaleDateString('en-PH', { day: '2-digit', timeZone: 'Asia/Manila' }),
  );
  const month = computed(() =>
    dateObj.value
      .toLocaleDateString('en-PH', { month: 'short', timeZone: 'Asia/Manila' })
      .toUpperCase(),
  );
  const year = computed(() =>
    dateObj.value.toLocaleDateString('en-PH', { year: 'numeric', timeZone: 'Asia/Manila' }),
  );
  const fullDate = computed(() =>
    dateObj.value.toLocaleDateString('en-PH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    }),
  );

  const isSettled = computed(() => props.session.status === 'settled');

  function goToSession() {
    void router.push(`/sessions/${props.session.id}`);
  }

  function onConfirmDelete() {
    emit('delete', props.session.id);
  }
</script>

<template>
  <article
    class="pp-session"
    :class="{ 'pp-session--settled': isSettled }"
    @click="goToSession"
  >
    <div class="pp-session__date">
      <div class="pp-session__day">{{ day }}</div>
      <div class="pp-session__month">{{ month }}</div>
      <div class="pp-session__year">{{ year }}</div>
    </div>

    <div class="pp-session__divider">
      <div class="pp-session__divider-line" />
    </div>

    <div class="pp-session__body">
      <div class="pp-session__status">
        <span
          v-if="!isSettled"
          class="pp-session__dot"
        />
        <span class="pp-session__status-label">
          {{ isSettled ? 'Settled' : 'Active' }}
        </span>
      </div>
      <h3 class="pp-session__title">{{ session.title }}</h3>
      <div class="pp-session__meta">{{ fullDate }}</div>
    </div>

    <div
      class="pp-session__actions"
      @click.stop
    >
      <q-btn
        flat
        dense
        round
        icon="arrow_forward"
        class="pp-session__action"
        aria-label="Open session"
        @click="goToSession"
      />
      <q-btn
        flat
        dense
        round
        icon="delete_outline"
        class="pp-session__action pp-session__action--danger"
        aria-label="Delete session"
        @click="showDeleteDialog = true"
      />
    </div>

    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Delete session"
      :message="`This will permanently delete &ldquo;${session.title}&rdquo; and all of its expenses. This can't be undone.`"
      @confirm="onConfirmDelete"
    />
  </article>
</template>

<style lang="scss" scoped>
  .pp-session {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    gap: clamp(0.85rem, 2.5vw, 1.5rem);
    padding: 1.1rem 1.25rem;
    background: var(--paper-deep);
    border: 1px solid var(--paper-edge);
    border-radius: 14px;
    box-shadow: var(--shadow-card);
    cursor: pointer;
    transition:
      transform 220ms var(--ease-ink),
      box-shadow 260ms var(--ease-ink),
      border-color 200ms var(--ease-ink);

    &:hover {
      transform: translateY(-2px);
      border-color: var(--dust);
      box-shadow: var(--shadow-paper);

      .pp-session__title {
        color: var(--rouge);
      }
    }
  }

  .pp-session--settled {
    background: var(--paper);

    .pp-session__day,
    .pp-session__title {
      color: var(--ink-mute);
    }
  }

  .pp-session__date {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 52px;
    line-height: 1;
  }

  .pp-session__day {
    font-family: var(--font-serif);
    font-size: 2.25rem;
    font-weight: 500;
    color: var(--ink);
    font-variation-settings:
      'opsz' 72,
      'SOFT' 40;
    letter-spacing: -0.02em;
  }

  .pp-session__month {
    margin-top: 4px;
    font-family: var(--font-sans);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: var(--rouge);
  }

  .pp-session__year {
    margin-top: 2px;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--ink-mute);
    letter-spacing: 0.04em;
  }

  .pp-session__divider {
    display: flex;
    align-items: stretch;
    height: 100%;
  }

  .pp-session__divider-line {
    width: 1px;
    background: var(--paper-edge);
    height: 44px;
    align-self: center;
  }

  .pp-session__body {
    min-width: 0;
  }

  .pp-session__status {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 4px;
  }

  .pp-session__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--rouge);
    box-shadow: 0 0 0 3px rgba(165, 50, 30, 0.15);
  }

  .pp-session__status-label {
    font-family: var(--font-sans);
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }

  .pp-session--settled .pp-session__status-label {
    color: var(--sage);
  }

  .pp-session__title {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.15rem, 3vw, 1.45rem);
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: var(--ink);
    font-variation-settings:
      'opsz' 48,
      'SOFT' 30;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 200ms var(--ease-ink);
  }

  .pp-session__meta {
    margin-top: 4px;
    font-family: var(--font-sans);
    font-size: 0.8rem;
    color: var(--ink-mute);
  }

  .pp-session__actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  :deep(.pp-session__action) {
    color: var(--ink-mute);
    width: 36px;
    height: 36px;
    min-height: 36px;
    min-width: 36px;

    &:hover {
      color: var(--ink);
      background: var(--paper);
    }
  }

  :deep(.pp-session__action--danger:hover) {
    color: var(--rouge);
  }

  @media (max-width: 480px) {
    .pp-session {
      grid-template-columns: auto 1fr auto;
      gap: 0.9rem;
      padding: 1rem;
    }
    .pp-session__divider {
      display: none;
    }
    .pp-session__day {
      font-size: 1.85rem;
    }
  }
</style>
