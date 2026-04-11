<script setup lang="ts">
  import { computed } from 'vue';
  import { useSessionStore } from 'src/stores/useSessionStore';
  import { computeBalances } from 'src/utils/balanceCalculator';
  import { simplifyDebts } from 'src/utils/debtSimplifier';
  import { formatPHP } from 'src/utils/currency';

  const props = defineProps<{
    sessionId: string;
  }>();

  const sessionStore = useSessionStore();

  const balances = computed(() => computeBalances(sessionStore.expenses, sessionStore.splits));

  const transactions = computed(() => simplifyDebts(balances.value));

  const totalExpenses = computed(() =>
    sessionStore.expenses
      .filter((e) => e.session_id === props.sessionId)
      .reduce((sum, e) => sum + e.amount, 0),
  );

  function getUserName(userId: string): string {
    return sessionStore.participants.find((p) => p.id === userId)?.name ?? 'Unknown';
  }
</script>

<template>
  <q-card flat>
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Balance Summary</div>

      <div class="text-caption text-grey q-mb-sm">
        Total expenses: {{ formatPHP(totalExpenses) }}
      </div>

      <div
        v-if="transactions.length === 0"
        class="text-positive text-center q-pa-sm"
      >
        You're all settled up!
      </div>

      <q-list
        v-else
        separator
        dense
      >
        <q-item
          v-for="(tx, i) in transactions"
          :key="i"
        >
          <q-item-section>
            <q-item-label> {{ getUserName(tx.from) }} owes {{ getUserName(tx.to) }} </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-weight-bold text-negative">
              {{ formatPHP(tx.amount) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div
        v-if="transactions.length > 0"
        class="text-caption text-grey q-mt-sm"
      >
        {{ sessionStore.participants.length }} people, {{ transactions.length }} payment{{
          transactions.length > 1 ? 's' : ''
        }}
        needed
      </div>
    </q-card-section>
  </q-card>
</template>
