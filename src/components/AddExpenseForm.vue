<script setup lang="ts">
  import { reactive } from 'vue';
  import { useQuasar } from 'quasar';
  import { useSessionStore } from 'src/stores/useSessionStore';
  import { ExpenseSchema } from 'src/types/schemas';

  const props = defineProps<{
    sessionId: string;
  }>();

  const model = defineModel<boolean>({ default: false });

  const $q = useQuasar();
  const sessionStore = useSessionStore();

  const form = reactive({
    description: '',
    amount: null as number | null,
    paid_by: '',
    category: 'other' as 'food' | 'transport' | 'accommodation' | 'other',
  });

  const categoryOptions = [
    { label: 'Food', value: 'food', icon: 'restaurant' },
    { label: 'Transport', value: 'transport', icon: 'directions_car' },
    { label: 'Stay', value: 'accommodation', icon: 'hotel' },
    { label: 'Other', value: 'other', icon: 'receipt_long' },
  ];

  function resetForm() {
    form.description = '';
    form.amount = null;
    form.paid_by = '';
    form.category = 'other';
  }

  async function onSubmit() {
    const input = {
      description: form.description,
      amount: form.amount ?? 0,
      paid_by: form.paid_by,
      category: form.category,
      session_id: props.sessionId,
    };

    const result = ExpenseSchema.safeParse(input);
    if (!result.success) {
      $q.notify({ type: 'negative', message: result.error.issues[0]?.message ?? 'Invalid input' });
      return;
    }

    try {
      await sessionStore.addExpense(result.data);
      model.value = false;
      resetForm();
      $q.notify({ type: 'positive', message: 'Expense recorded.' });
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to add expense.' });
    }
  }

  function onCancel() {
    model.value = false;
  }
</script>

<template>
  <q-dialog
    :model-value="model"
    @update:model-value="model = $event"
  >
    <div class="pp-expense-dialog">
      <header class="pp-expense-dialog__head">
        <div class="eyebrow">New entry</div>
        <h2 class="display-md pp-expense-dialog__title">Record an expense</h2>
        <p class="pp-expense-dialog__sub">
          Who paid, how much, and for what. We'll split it evenly across participants.
        </p>
      </header>

      <div
        class="dotted-rule"
        aria-hidden="true"
        style="margin: 0.5rem 0 1.25rem"
      />

      <form
        class="pp-expense-dialog__form"
        novalidate
        @submit.prevent="onSubmit"
      >
        <div class="pp-expense-dialog__field">
          <label
            for="expense-desc"
            class="small-caps"
            >Description</label
          >
          <q-input
            id="expense-desc"
            v-model="form.description"
            placeholder="Dinner, Grab, Airbnb..."
            outlined
            hide-bottom-space
            :rules="[(val) => !!val || 'Give this expense a description']"
          />
        </div>

        <div class="pp-expense-dialog__row">
          <div class="pp-expense-dialog__field">
            <label
              for="expense-amount"
              class="small-caps"
              >Amount (₱)</label
            >
            <q-input
              id="expense-amount"
              v-model.number="form.amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              outlined
              hide-bottom-space
              :rules="[(val) => (val && val > 0) || 'Must be greater than 0']"
              input-class="pp-expense-dialog__amount"
            >
              <template #prepend>
                <span class="pp-expense-dialog__peso">₱</span>
              </template>
            </q-input>
          </div>

          <div class="pp-expense-dialog__field">
            <label
              for="expense-payer"
              class="small-caps"
              >Paid by</label
            >
            <q-select
              id="expense-payer"
              v-model="form.paid_by"
              :options="sessionStore.participants"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              placeholder="Select a person"
              outlined
              hide-bottom-space
              :rules="[(val) => !!val || 'Pick who paid']"
            />
          </div>
        </div>

        <div class="pp-expense-dialog__field">
          <label class="small-caps">Category</label>
          <div class="pp-cats">
            <button
              v-for="opt in categoryOptions"
              :key="opt.value"
              type="button"
              class="pp-cat"
              :class="{ 'pp-cat--active': form.category === opt.value }"
              @click="form.category = opt.value as typeof form.category"
            >
              <q-icon
                :name="opt.icon"
                size="18px"
              />
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <div class="pp-expense-dialog__actions">
          <q-btn
            label="Cancel"
            flat
            no-caps
            class="pp-expense-dialog__cancel"
            @click="onCancel"
          />
          <q-btn
            label="Add expense"
            icon-right="arrow_forward"
            type="submit"
            color="primary"
            unelevated
            no-caps
            class="pp-expense-dialog__submit"
            :loading="sessionStore.loading"
          />
        </div>
      </form>
    </div>
  </q-dialog>
</template>

<style lang="scss" scoped>
  .pp-expense-dialog {
    min-width: min(440px, 94vw);
    max-width: 520px;
    padding: clamp(1.25rem, 3vw, 1.75rem);
    background: var(--paper-deep);
    border: 1px solid var(--paper-edge);
    border-radius: 16px;
    box-shadow: var(--shadow-paper);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 1.5rem;
      right: 1.5rem;
      height: 3px;
      background: var(--rouge);
      border-radius: 0 0 3px 3px;
    }
  }

  .pp-expense-dialog__title {
    margin: 0.45rem 0 0.4rem;
    color: var(--ink);
  }

  .pp-expense-dialog__sub {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 0.95rem;
    color: var(--ink-mute);
    font-style: italic;
    font-variation-settings:
      'opsz' 16,
      'SOFT' 40;
  }

  .pp-expense-dialog__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .pp-expense-dialog__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      color: var(--ink);
    }
  }

  .pp-expense-dialog__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.85rem;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .pp-expense-dialog__peso {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    color: var(--rouge);
    font-weight: 500;
  }

  :deep(.pp-expense-dialog__amount) {
    font-family: var(--font-serif);
    font-size: 1.15rem;
    font-variant-numeric: tabular-nums;
  }

  // Category pills
  .pp-cats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.4rem;

    @media (max-width: 420px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .pp-cat {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 0.75rem 0.5rem;
    border: 1px solid var(--paper-edge);
    border-radius: 10px;
    background: var(--paper);
    color: var(--ink-mute);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    transition: all 180ms var(--ease-ink);

    &:hover {
      color: var(--ink);
      border-color: var(--dust);
    }
  }

  .pp-cat--active {
    background: var(--rouge);
    border-color: var(--rouge);
    color: var(--paper);

    &:hover {
      color: var(--paper);
    }
  }

  .pp-expense-dialog__actions {
    margin-top: 0.75rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  :deep(.pp-expense-dialog__cancel) {
    color: var(--ink-mute);
  }

  :deep(.pp-expense-dialog__submit) {
    padding: 0.75rem 1.25rem;
  }
</style>
