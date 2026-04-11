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
    { label: 'Food', value: 'food' },
    { label: 'Transport', value: 'transport' },
    { label: 'Accommodation', value: 'accommodation' },
    { label: 'Other', value: 'other' },
  ];

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
      form.description = '';
      form.amount = null;
      form.paid_by = '';
      form.category = 'other';
      $q.notify({ type: 'positive', message: 'Expense added!' });
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to add expense.' });
    }
  }
</script>

<template>
  <q-dialog
    :model-value="model"
    @update:model-value="model = $event"
  >
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Add Expense</div>
      </q-card-section>

      <q-card-section>
        <q-form
          class="q-gutter-sm"
          @submit.prevent="onSubmit"
        >
          <q-input
            v-model="form.description"
            label="Description"
            outlined
            dense
            :rules="[(val) => !!val || 'Description is required']"
          />

          <q-input
            v-model.number="form.amount"
            label="Amount (₱)"
            type="number"
            outlined
            dense
            :rules="[(val) => (val && val > 0) || 'Amount must be greater than 0']"
          />

          <q-select
            v-model="form.paid_by"
            label="Paid By"
            :options="sessionStore.participants"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            outlined
            dense
            :rules="[(val) => !!val || 'Payer is required']"
          />

          <q-select
            v-model="form.category"
            label="Category"
            :options="categoryOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
          />

          <q-btn
            label="Add Expense"
            type="submit"
            color="primary"
            class="full-width q-mt-md"
            :loading="sessionStore.loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
