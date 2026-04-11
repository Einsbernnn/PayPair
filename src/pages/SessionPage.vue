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
      $q.notify({ type: 'positive', message: 'Participant added!' });
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
      $q.notify({ type: 'positive', message: `${user.name} created and added!` });
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
</script>

<template>
  <q-page padding>
    <LoadingSpinner v-if="sessionStore.loading" />

    <template v-else-if="sessionStore.currentSession">
      <div class="row items-center q-mb-md">
        <div class="text-h5 col">{{ sessionStore.currentSession.title }}</div>
        <q-badge
          :color="sessionStore.currentSession.status === 'active' ? 'green' : 'grey'"
          :label="sessionStore.currentSession.status"
        />
      </div>

      <BalanceSummary :session-id="sessionId" />

      <q-separator
        spaced
        class="q-my-md"
      />

      <!-- Participants Section -->
      <div class="text-h6 q-mb-sm">Participants</div>

      <!-- Create new participant -->
      <div class="text-caption text-grey q-mb-xs">Create new person</div>
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-input
          v-model="newUserName"
          label="Name"
          outlined
          dense
          class="col"
          @keyup.enter="handleCreateAndAdd"
        />
        <q-btn
          icon="person_add"
          color="primary"
          dense
          label="Create & Add"
          :disable="!newUserName.trim()"
          @click="handleCreateAndAdd"
        />
      </div>

      <!-- Or pick from existing users -->
      <div
        v-if="availableUsers.length > 0"
        class="q-mb-sm"
      >
        <div class="text-caption text-grey q-mb-xs">Or add existing person</div>
        <div class="row items-center q-gutter-sm">
          <q-select
            v-model="selectedUser"
            :options="availableUsers"
            option-value="id"
            option-label="name"
            label="Select person"
            outlined
            dense
            class="col"
            clearable
          />
          <q-btn
            icon="person_add"
            color="secondary"
            dense
            :disable="!selectedUser"
            @click="handleAddParticipant"
          />
        </div>
      </div>
      <q-list
        v-if="sessionStore.participants.length > 0"
        bordered
        separator
        class="rounded-borders q-mb-md"
      >
        <q-item
          v-for="p in sessionStore.participants"
          :key="p.id"
        >
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>{{ p.name }}</q-item-section>
          <q-item-section side>
            <q-btn
              flat
              round
              dense
              icon="close"
              color="negative"
              @click="handleRemoveParticipant(p.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <div
        v-else
        class="text-caption text-grey q-mb-md"
      >
        No participants yet. Add people to split expenses with.
      </div>

      <q-separator
        spaced
        class="q-my-md"
      />

      <div class="row items-center q-mb-sm">
        <div class="text-h6 col">Expenses</div>
        <q-btn
          round
          color="primary"
          icon="add"
          @click="sessionStore.showAddExpense = true"
        />
      </div>

      <EmptyState
        v-if="sessionStore.expenses.length === 0"
        icon="receipt_long"
        message="No expenses yet. Add one!"
      />
      <ExpenseList
        v-else
        :expenses="sessionStore.expenses"
      />

      <AddExpenseForm
        v-model="sessionStore.showAddExpense"
        :session-id="sessionId"
      />
    </template>

    <EmptyState
      v-else
      icon="error_outline"
      message="Session not found."
    />
  </q-page>
</template>
