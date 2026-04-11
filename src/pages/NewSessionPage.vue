<script setup lang="ts">
  import { reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { useSessionStore } from 'src/stores/useSessionStore';

  const $q = useQuasar();
  const router = useRouter();
  const sessionStore = useSessionStore();

  const form = reactive({
    title: '',
    date: '',
  });

  async function onSubmit() {
    if (!form.title || !form.date) {
      $q.notify({ type: 'negative', message: 'Title and date are required.' });
      return;
    }

    try {
      const session = await sessionStore.createSession(form.title, form.date);
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
            v-model="form.date"
            label="Date"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Date is required']"
          />

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
