<script setup lang="ts">
  import { onMounted, computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { useSessionStore } from 'src/stores/useSessionStore';
  import type { User } from 'src/types';
  import ExpenseList from 'src/components/ExpenseList.vue';
  import BalanceSummary from 'src/components/BalanceSummary.vue';
  import AddExpenseForm from 'src/components/AddExpenseForm.vue';
  import EmptyState from 'src/components/EmptyState.vue';
  import LoadingSpinner from 'src/components/LoadingSpinner.vue';

  const route = useRoute();
  const $q = useQuasar();
  const sessionStore = useSessionStore();
  const sessionId = computed(() => route.params.id as string);

  const selectedUser = ref<User | null>(null);
  const newUserName = ref('');

  const availableUsers = computed(() =>
    sessionStore.allUsers.filter((u) => !sessionStore.participants.some((p) => p.id === u.id)),
  );

  const sessionDate = computed(() => {
    const d = sessionStore.currentSession?.date;
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-PH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    });
  });

  const isSettled = computed(() => sessionStore.currentSession?.status === 'settled');

  onMounted(async () => {
    await Promise.all([
      sessionStore.fetchSessionById(sessionId.value),
      sessionStore.fetchAllUsers(),
    ]);
  });

  async function handleAddParticipant() {
    if (!selectedUser.value) return;
    try {
      await sessionStore.addParticipant(sessionId.value, selectedUser.value.id);
      selectedUser.value = null;
      $q.notify({ type: 'positive', message: 'Participant added.' });
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to add participant.' });
    }
  }

  async function handleCreateAndAdd() {
    const name = newUserName.value.trim();
    if (!name) return;
    try {
      const user = await sessionStore.createUser(name);
      await sessionStore.addParticipant(sessionId.value, user.id);
      newUserName.value = '';
      $q.notify({ type: 'positive', message: `${user.name} added.` });
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to create participant.' });
    }
  }

  async function handleRemoveParticipant(userId: string) {
    try {
      await sessionStore.removeParticipant(sessionId.value, userId);
      $q.notify({ type: 'positive', message: 'Participant removed.' });
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to remove participant.' });
    }
  }

  function initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  }
</script>

<template>
  <q-page class="pp-session-page">
    <LoadingSpinner v-if="sessionStore.loading && !sessionStore.currentSession" />

    <template v-else-if="sessionStore.currentSession">
      <!-- Editorial header -->
      <header class="pp-session-page__header">
        <div class="pp-session-page__folio">
          <span>Session</span>
          <span class="pp-session-page__folio-date">{{ sessionDate }}</span>
        </div>

        <h1 class="display-xl pp-session-page__title">
          {{ sessionStore.currentSession.title }}
        </h1>

        <div class="pp-session-page__status-row">
          <span
            class="pp-session-page__status"
            :class="{ 'pp-session-page__status--settled': isSettled }"
          >
            <span
              class="pp-session-page__status-dot"
              :class="{ 'pp-session-page__status-dot--settled': isSettled }"
            />
            {{ isSettled ? 'Settled' : 'Active' }}
          </span>
          <span
            class="pp-session-page__status-meta"
            v-if="sessionStore.participants.length > 0"
          >
            · {{ sessionStore.participants.length }}
            {{ sessionStore.participants.length === 1 ? 'participant' : 'participants' }}
          </span>
          <span
            class="pp-session-page__status-meta"
            v-if="sessionStore.expenses.length > 0"
          >
            · {{ sessionStore.expenses.length }}
            {{ sessionStore.expenses.length === 1 ? 'expense' : 'expenses' }}
          </span>
        </div>
      </header>

      <div
        class="dotted-rule pp-session-page__rule"
        aria-hidden="true"
      />

      <!-- Balance hero -->
      <BalanceSummary :session-id="sessionId" />

      <!-- Participants -->
      <section class="pp-section">
        <div class="pp-section__head">
          <div class="eyebrow">Participants</div>
          <div
            class="pp-section__count"
            v-if="sessionStore.participants.length"
          >
            {{ sessionStore.participants.length }}
          </div>
        </div>

        <div
          v-if="sessionStore.participants.length > 0"
          class="pp-chips"
        >
          <div
            v-for="p in sessionStore.participants"
            :key="p.id"
            class="pp-chip"
          >
            <span class="pp-chip__avatar">{{ initials(p.name) }}</span>
            <span class="pp-chip__name">{{ p.name }}</span>
            <button
              type="button"
              class="pp-chip__remove"
              :aria-label="`Remove ${p.name}`"
              @click="handleRemoveParticipant(p.id)"
            >
              ×
            </button>
          </div>
        </div>
        <p
          v-else
          class="pp-section__empty"
        >
          No one here yet. Add the people splitting this session below.
        </p>

        <div class="pp-add-grid">
          <div class="pp-add-row">
            <div class="small-caps pp-add-row__label">Add new person</div>
            <div class="pp-add-row__input">
              <q-input
                v-model="newUserName"
                placeholder="Enter a name"
                outlined
                hide-bottom-space
                @keyup.enter="handleCreateAndAdd"
              />
              <q-btn
                unelevated
                no-caps
                icon="person_add"
                label="Add"
                color="primary"
                :disable="!newUserName.trim()"
                class="pp-add-row__btn"
                @click="handleCreateAndAdd"
              />
            </div>
          </div>

          <div
            v-if="availableUsers.length > 0"
            class="pp-add-row"
          >
            <div class="small-caps pp-add-row__label">Or pick from the book</div>
            <div class="pp-add-row__input">
              <q-select
                v-model="selectedUser"
                :options="availableUsers"
                option-value="id"
                option-label="name"
                placeholder="Select someone"
                outlined
                hide-bottom-space
                clearable
              />
              <q-btn
                unelevated
                no-caps
                icon="group_add"
                label="Add"
                color="secondary"
                :disable="!selectedUser"
                class="pp-add-row__btn"
                @click="handleAddParticipant"
              />
            </div>
          </div>
        </div>
      </section>

      <div
        class="dotted-rule pp-session-page__rule"
        aria-hidden="true"
      />

      <!-- Expenses -->
      <section class="pp-section">
        <div class="pp-section__head pp-section__head--action">
          <div>
            <div class="eyebrow">Expenses</div>
            <div
              class="pp-section__count"
              v-if="sessionStore.expenses.length"
              style="display: inline-block; margin-top: 4px"
            >
              {{ sessionStore.expenses.length }} recorded
            </div>
          </div>
          <q-btn
            unelevated
            no-caps
            icon="add"
            label="Record expense"
            color="primary"
            class="pp-add-expense"
            :disable="sessionStore.participants.length === 0"
            @click="sessionStore.showAddExpense = true"
          />
        </div>

        <EmptyState
          v-if="sessionStore.expenses.length === 0"
          icon="receipt_long"
          title="No expenses yet"
          message="Add the first one and we'll start splitting it for you."
        />
        <ExpenseList
          v-else
          :expenses="sessionStore.expenses"
        />
      </section>

      <AddExpenseForm
        v-model="sessionStore.showAddExpense"
        :session-id="sessionId"
      />
    </template>

    <EmptyState
      v-else
      icon="error_outline"
      title="Session not found"
      message="It may have been deleted, or the link is wrong."
      action-label="Back to sessions"
      action-to="/sessions"
    />
  </q-page>
</template>

<style lang="scss" scoped>
  .pp-session-page {
    padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 2rem) 7rem;
    max-width: 820px;
    margin: 0 auto;
  }

  .pp-session-page__folio {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }

  .pp-session-page__folio-date {
    color: var(--rouge);
    letter-spacing: 0.06em;
  }

  .pp-session-page__title {
    margin: 0.75rem 0 0.5rem;
    color: var(--ink);
    font-size: clamp(2rem, 7.5vw, 3.5rem);
    overflow-wrap: break-word;
  }

  .pp-session-page__status-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.35rem;
    color: var(--ink-mute);
    font-size: 0.85rem;
  }

  .pp-session-page__status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-sans);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    background: rgba(165, 50, 30, 0.08);
    color: var(--rouge);
    border: 1px solid rgba(165, 50, 30, 0.25);
  }

  .pp-session-page__status--settled {
    background: rgba(107, 117, 86, 0.12);
    color: var(--sage);
    border-color: rgba(107, 117, 86, 0.3);
  }

  .pp-session-page__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--rouge);
    box-shadow: 0 0 0 3px rgba(165, 50, 30, 0.18);
  }

  .pp-session-page__status-dot--settled {
    background: var(--sage);
    box-shadow: 0 0 0 3px rgba(107, 117, 86, 0.18);
  }

  .pp-session-page__status-meta {
    font-family: var(--font-sans);
  }

  .pp-session-page__rule {
    margin: 1.75rem 0;
  }

  // Generic section
  .pp-section {
    margin-bottom: 1.5rem;
  }

  .pp-section__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .pp-section__head--action {
    margin-bottom: 1.25rem;
  }

  .pp-section__count {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--ink-mute);
    letter-spacing: 0.08em;
  }

  .pp-section__empty {
    margin: 0 0 1rem;
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--ink-mute);
    font-size: 0.95rem;
    font-variation-settings:
      'opsz' 16,
      'SOFT' 50;
  }

  // Participant chips
  .pp-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .pp-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.4rem 0.4rem 0.4rem 0.5rem;
    background: var(--paper-deep);
    border: 1px solid var(--paper-edge);
    border-radius: 999px;
    transition: border-color 200ms var(--ease-ink);

    &:hover {
      border-color: var(--dust);
    }
  }

  .pp-chip__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--rouge);
    color: var(--paper);
    font-family: var(--font-serif);
    font-size: 0.78rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0;
    font-variation-settings:
      'opsz' 14,
      'SOFT' 30;
  }

  .pp-chip__name {
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--ink);
    padding-right: 0.25rem;
  }

  .pp-chip__remove {
    background: transparent;
    border: none;
    color: var(--ink-mute);
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.45rem;
    border-radius: 999px;
    transition: color 160ms var(--ease-ink);

    &:hover {
      color: var(--rouge);
    }
  }

  // Add-participant rows
  .pp-add-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: var(--paper);
    border: 1px dashed var(--paper-edge);
    border-radius: 12px;
  }

  .pp-add-row__label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--ink);
  }

  .pp-add-row__input {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
    align-items: stretch;
  }

  :deep(.pp-add-row__btn) {
    padding: 0 1.1rem;
    min-height: 48px;
  }

  @media (max-width: 520px) {
    .pp-add-row__input {
      grid-template-columns: 1fr;
    }
  }

  :deep(.pp-add-expense) {
    padding: 0.7rem 1.1rem;
  }
</style>
