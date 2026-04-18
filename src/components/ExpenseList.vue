<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { Expense } from 'src/types';
  import { formatPHP } from 'src/utils/currency';
  import ConfirmDialog from 'src/components/ConfirmDialog.vue';
  import { useSessionStore } from 'src/stores/useSessionStore';

  const props = defineProps<{
    expenses: Expense[];
  }>();

  const sessionStore = useSessionStore();
  const confirmDelete = ref(false);
  const pendingDeleteId = ref<string | null>(null);

  const categoryIcons: Record<string, string> = {
    food: 'restaurant',
    transport: 'directions_car',
    accommodation: 'hotel',
    other: 'receipt_long',
  };

  const categoryLabels: Record<string, string> = {
    food: 'Food',
    transport: 'Transport',
    accommodation: 'Stay',
    other: 'Other',
  };

  const orderedExpenses = computed(() => [...props.expenses].reverse());

  function payerName(userId: string): string {
    return sessionStore.participants.find((p) => p.id === userId)?.name ?? 'Unknown';
  }

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
  <div class="pp-receipt">
    <div
      class="pp-receipt__top"
      aria-hidden="true"
    />
    <ul class="pp-receipt__list">
      <li
        v-for="(expense, i) in orderedExpenses"
        :key="expense.id"
        class="pp-receipt__item"
        :style="{ animationDelay: `${i * 40}ms` }"
      >
        <div class="pp-receipt__icon">
          <q-icon
            :name="categoryIcons[expense.category] ?? 'receipt_long'"
            size="18px"
          />
        </div>

        <div class="pp-receipt__body">
          <div class="pp-receipt__desc">{{ expense.description }}</div>
          <div class="pp-receipt__meta">
            <span class="pp-receipt__cat">{{
              categoryLabels[expense.category] ?? 'Other'
            }}</span>
            <span
              class="pp-receipt__dot"
              aria-hidden="true"
              >·</span
            >
            <span class="pp-receipt__paid">paid by {{ payerName(expense.paid_by) }}</span>
          </div>
        </div>

        <div class="pp-receipt__leaders" aria-hidden="true" />

        <div class="pp-receipt__amount money">
          {{ formatPHP(expense.amount) }}
        </div>

        <button
          type="button"
          class="pp-receipt__del"
          aria-label="Delete expense"
          @click="askDelete(expense.id)"
        >
          ×
        </button>
      </li>
    </ul>
    <div
      class="pp-receipt__bottom"
      aria-hidden="true"
    />
  </div>

  <ConfirmDialog
    v-model="confirmDelete"
    title="Delete expense"
    message="This will remove the expense and recompute the balances. Continue?"
    @confirm="onConfirmDelete"
  />
</template>

<style lang="scss" scoped>
  .pp-receipt {
    background: var(--paper);
    border: 1px solid var(--paper-edge);
    border-radius: 10px;
    position: relative;
    padding: 0.5rem 1.1rem;
    box-shadow: var(--shadow-card);
  }

  // Perforated tear-edge at top
  .pp-receipt__top,
  .pp-receipt__bottom {
    position: absolute;
    left: 0;
    right: 0;
    height: 10px;
    background:
      radial-gradient(circle at 6px center, var(--paper) 5px, transparent 5.5px) 0 0 / 12px 10px
        repeat-x;
    filter: drop-shadow(0 0 0 var(--paper-edge));
  }

  .pp-receipt__top {
    top: -6px;
  }
  .pp-receipt__bottom {
    bottom: -6px;
    transform: scaleY(-1);
  }

  .pp-receipt__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .pp-receipt__item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) 1fr auto auto;
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.85rem 0.25rem;
    border-bottom: 1px dashed var(--paper-edge);
    animation: pp-rise 400ms var(--ease-ink) both;

    &:last-child {
      border-bottom: none;
    }

    &:hover .pp-receipt__del {
      opacity: 1;
    }
  }

  .pp-receipt__icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--paper-deep);
    color: var(--rouge);
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
  }

  .pp-receipt__body {
    min-width: 0;
  }

  .pp-receipt__desc {
    font-family: var(--font-serif);
    font-size: 1.02rem;
    font-weight: 500;
    line-height: 1.2;
    color: var(--ink);
    font-variation-settings:
      'opsz' 18,
      'SOFT' 30;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pp-receipt__meta {
    margin-top: 3px;
    font-family: var(--font-sans);
    font-size: 0.75rem;
    color: var(--ink-mute);
    display: inline-flex;
    gap: 0.4rem;
  }

  .pp-receipt__cat {
    color: var(--rouge);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 0.68rem;
  }

  .pp-receipt__paid {
    font-style: italic;
    font-family: var(--font-serif);
    font-size: 0.82rem;
    font-variation-settings:
      'opsz' 14,
      'SOFT' 40;
  }

  .pp-receipt__leaders {
    align-self: end;
    margin-bottom: 0.45rem;
    background-image: radial-gradient(circle, var(--dust) 0.9px, transparent 1.1px);
    background-size: 6px 2px;
    background-repeat: repeat-x;
    background-position: left center;
    height: 2px;
    min-width: 1.5rem;
  }

  .pp-receipt__amount {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--ink);
    text-align: right;
    white-space: nowrap;
    font-variation-settings:
      'opsz' 24,
      'SOFT' 20;
  }

  .pp-receipt__del {
    background: transparent;
    border: none;
    color: var(--ink-mute);
    font-size: 1.35rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.45rem;
    border-radius: 6px;
    opacity: 0.6;
    transition:
      opacity 160ms var(--ease-ink),
      color 160ms var(--ease-ink),
      background 160ms var(--ease-ink);
    align-self: center;

    &:hover {
      color: var(--rouge);
      background: rgba(165, 50, 30, 0.08);
      opacity: 1;
    }
  }

  @media (max-width: 520px) {
    .pp-receipt__item {
      grid-template-columns: auto minmax(0, 1fr) auto auto;
      gap: 0.6rem;
    }
    .pp-receipt__leaders {
      display: none;
    }
  }
</style>
