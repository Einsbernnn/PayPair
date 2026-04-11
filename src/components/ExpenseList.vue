<script setup lang="ts">
  import type { Expense } from 'src/types';
  import { formatPHP } from 'src/utils/currency';
  import ConfirmDialog from 'src/components/ConfirmDialog.vue';
  import { ref } from 'vue';
  import { useSessionStore } from 'src/stores/useSessionStore';

  defineProps<{
    expenses: Expense[];
  }>();

  const sessionStore = useSessionStore();
  const confirmDelete = ref(false);
  const pendingDeleteId = ref<string | null>(null);

  const categoryIcons: Record<string, string> = {
    food: 'restaurant',
    transport: 'directions_car',
    accommodation: 'hotel',
    other: 'receipt',
  };

  function askDelete(id: string) {
    pendingDeleteId.value = id;
    confirmDelete.value = true;
  }

  async function onConfirmDelete() {
    if (pendingDeleteId.value) {
      await sessionStore.deleteExpense(pendingDeleteId.value);
    }
  }
</script>

<template>
  <q-list separator>
    <q-item
      v-for="expense in expenses"
      :key="expense.id"
    >
      <q-item-section avatar>
        <q-icon
          :name="categoryIcons[expense.category] ?? 'receipt'"
          color="primary"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ expense.description }}</q-item-label>
        <q-item-label caption>{{ expense.category }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-item-label class="text-weight-bold">{{ formatPHP(expense.amount) }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          dense
          round
          icon="delete"
          color="negative"
          @click="askDelete(expense.id)"
        />
      </q-item-section>
    </q-item>
  </q-list>

  <ConfirmDialog
    v-model="confirmDelete"
    title="Delete Expense"
    message="Are you sure you want to delete this expense?"
    @confirm="onConfirmDelete"
  />
</template>
