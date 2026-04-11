<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuasar, date as qdate } from 'quasar';
  import { useSessionStore } from 'src/stores/useSessionStore';

  const $q = useQuasar();
  const router = useRouter();
  const sessionStore = useSessionStore();

  const today = qdate.formatDate(Date.now(), 'YYYY/MM/DD');
  const showDatePicker = ref(false);

  const form = reactive({
    title: '',
    date: today,
  });

  function onDatePicked(value: string) {
    form.date = value;
    showDatePicker.value = false;
  }

  const displayDate = () => {
    if (!form.date) return '';
    return qdate.formatDate(new Date(form.date), 'MMMM D, YYYY');
  };

  async function onSubmit() {
    if (!form.title || !form.date) {
      $q.notify({ type: 'negative', message: 'Title and date are required.' });
      return;
    }

    try {
      const dateForDb = form.date.replace(/\//g, '-');
      const session = await sessionStore.createSession(form.title, dateForDb);
      $q.notify({ type: 'positive', message: 'Session created!' });
      await router.push(`/sessions/${session.id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      $q.notify({ type: 'negative', message: 'Failed to create session.' });
    }
  }
</script>

<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">New Session</div>

    <q-card>
      <q-card-section>
        <q-form
          class="q-gutter-md"
          @submit.prevent="onSubmit"
        >
          <q-input
            v-model="form.title"
            label="Session Title"
            hint="e.g., Dinner at Lusso"
            outlined
            dense
            :rules="[(val) => !!val || 'Title is required']"
          />

          <q-input
            :model-value="displayDate()"
            label="Date"
            outlined
            dense
            readonly
            :rules="[() => !!form.date || 'Date is required']"
            @click="showDatePicker = true"
          >
            <template #prepend>
              <q-icon
                name="event"
                class="cursor-pointer"
                @click="showDatePicker = true"
              />
            </template>
            <q-popup-proxy
              v-model="showDatePicker"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                :model-value="form.date"
                mask="YYYY/MM/DD"
                :options="(d: string) => d <= today"
                @update:model-value="onDatePicked"
              />
            </q-popup-proxy>
          </q-input>

          <q-btn
            label="Create Session"
            type="submit"
            color="primary"
            class="full-width"
            :loading="sessionStore.loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>
