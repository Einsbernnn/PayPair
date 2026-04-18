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

  const totalFormatted = computed(() => formatPHP(totalExpenses.value));

  const hasExpenses = computed(() => totalExpenses.value > 0);
  const allSettled = computed(() => hasExpenses.value && transactions.value.length === 0);

  function getUserName(userId: string): string {
    return sessionStore.participants.find((p) => p.id === userId)?.name ?? 'Unknown';
  }
</script>

<template>
  <section class="pp-balance">
    <div class="pp-balance__head">
      <div class="eyebrow">The tally</div>
      <div
        v-if="hasExpenses"
        class="small-caps pp-balance__count"
      >
        {{ sessionStore.participants.length }}
        {{ sessionStore.participants.length === 1 ? 'person' : 'people' }} ·
        {{ transactions.length }} {{ transactions.length === 1 ? 'payment' : 'payments' }}
      </div>
    </div>

    <div class="pp-balance__total">
      <div class="money pp-balance__total-num">{{ totalFormatted }}</div>
      <div class="small-caps pp-balance__total-label">Total spent</div>
    </div>

    <div
      class="dotted-rule pp-balance__rule"
      aria-hidden="true"
    />

    <!-- Settled state -->
    <div
      v-if="!hasExpenses"
      class="pp-balance__empty"
    >
      <p class="pp-balance__empty-text">
        <em>No expenses yet.</em> Record the first one below and the tally will write itself.
      </p>
    </div>

    <div
      v-else-if="allSettled"
      class="pp-balance__settled"
    >
      <div
        class="pp-balance__stamp pp-stamp"
        aria-hidden="true"
      >
        SETTLED
      </div>
      <h3 class="pp-balance__settled-title">You're all settled up.</h3>
      <p class="pp-balance__settled-sub">
        Every peso balances. No one owes anyone. A rare and beautiful thing.
      </p>
    </div>

    <!-- Transactions -->
    <ol
      v-else
      class="pp-balance__list"
    >
      <li
        v-for="(tx, i) in transactions"
        :key="i"
        class="pp-tx pp-rise"
        :style="{ animationDelay: `${i * 60 + 100}ms` }"
      >
        <div class="pp-tx__num">{{ String(i + 1).padStart(2, '0') }}</div>
        <div class="pp-tx__main">
          <div class="pp-tx__line">
            <span class="pp-tx__from">{{ getUserName(tx.from) }}</span>
            <span
              class="pp-tx__arrow"
              aria-hidden="true"
              >&rarr;</span
            >
            <span class="pp-tx__to">{{ getUserName(tx.to) }}</span>
          </div>
          <div class="pp-tx__sub">pays</div>
        </div>
        <div class="pp-tx__amount money">
          {{ formatPHP(tx.amount) }}
        </div>
      </li>
    </ol>
  </section>
</template>

<style lang="scss" scoped>
  .pp-balance {
    margin: 1rem 0 1.5rem;
    padding: clamp(1.25rem, 3vw, 1.75rem);
    background: var(--paper-deep);
    border: 1px solid var(--paper-edge);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    position: relative;
    overflow: hidden;
  }

  .pp-balance::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--rouge) 0%, var(--gold) 50%, var(--sage) 100%);
    opacity: 0.9;
  }

  .pp-balance__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.25rem;
  }

  .pp-balance__count {
    color: var(--ink-mute);
    font-size: 0.65rem;
  }

  .pp-balance__total {
    margin-top: 0.35rem;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.85rem;
  }

  .pp-balance__total-num {
    font-size: clamp(2.5rem, 9vw, 4.25rem);
    font-weight: 400;
    line-height: 1;
    color: var(--ink);
    font-variation-settings:
      'opsz' 144,
      'SOFT' 30;
  }

  .pp-balance__total-label {
    color: var(--ink-mute);
  }

  .pp-balance__rule {
    margin: 1.25rem 0;
  }

  .pp-balance__empty-text {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.05rem;
    color: var(--ink-mute);
    font-variation-settings:
      'opsz' 20,
      'SOFT' 40;

    em {
      color: var(--ink);
      font-style: italic;
    }
  }

  // Settled state
  .pp-balance__settled {
    position: relative;
    padding: 1rem 0 0.25rem;
  }

  .pp-balance__stamp {
    position: absolute;
    top: -0.25rem;
    right: -0.5rem;
    font-family: var(--font-serif);
    font-weight: 500;
    font-size: 2.25rem;
    letter-spacing: 0.2em;
    color: var(--sage);
    border: 3px solid var(--sage);
    padding: 0.4rem 1rem;
    border-radius: 6px;
    opacity: 0.25;
    transform: rotate(-6deg);
    pointer-events: none;
    font-variation-settings:
      'opsz' 72,
      'SOFT' 20;
  }

  .pp-balance__settled-title {
    margin: 0 0 0.5rem;
    font-family: var(--font-serif);
    font-size: 1.75rem;
    font-weight: 500;
    color: var(--sage);
    font-variation-settings:
      'opsz' 48,
      'SOFT' 40;
  }

  .pp-balance__settled-sub {
    margin: 0;
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--ink-mute);
    max-width: 42ch;
    line-height: 1.5;
    font-variation-settings:
      'opsz' 16,
      'SOFT' 50;
  }

  // Transaction list
  .pp-balance__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .pp-tx {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: 0.9rem 0.25rem;
    border-bottom: 1px dashed var(--paper-edge);

    &:last-child {
      border-bottom: none;
    }
  }

  .pp-tx__num {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--ink-mute);
    letter-spacing: 0.08em;
    align-self: start;
    padding-top: 0.35rem;
  }

  .pp-tx__line {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
    font-family: var(--font-serif);
    font-size: clamp(1.05rem, 2.5vw, 1.25rem);
    line-height: 1.3;
    color: var(--ink);
    font-variation-settings:
      'opsz' 24,
      'SOFT' 30;
  }

  .pp-tx__from {
    color: var(--rouge);
    font-weight: 500;
  }

  .pp-tx__arrow {
    color: var(--ink-mute);
    font-size: 0.95em;
  }

  .pp-tx__to {
    color: var(--ink);
    font-weight: 500;
  }

  .pp-tx__sub {
    margin-top: 0.15rem;
    font-family: var(--font-sans);
    font-style: italic;
    font-size: 0.78rem;
    color: var(--ink-mute);
  }

  .pp-tx__amount {
    font-size: clamp(1.15rem, 3vw, 1.5rem);
    font-weight: 500;
    color: var(--rouge-deep);
    text-align: right;
    font-variation-settings:
      'opsz' 48,
      'SOFT' 20;
  }
</style>
