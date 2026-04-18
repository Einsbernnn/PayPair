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
      $q.notify({ type: 'positive', message: 'Session created.' });
      await router.push(`/sessions/${session.id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      $q.notify({ type: 'negative', message: 'Failed to create session.' });
    }
  }
</script>

<template>
  <q-page class="pp-new">
    <header class="pp-new__header">
      <div class="eyebrow">Nº 03 · Begin a new entry</div>
      <h1 class="display-lg pp-new__title">Start a session.</h1>
      <p class="pp-new__sub">
        Give it a name you'll recognise later &mdash; the dinner, the trip, the evening out. You can
        add people and expenses on the next screen.
      </p>
    </header>

    <div
      class="dotted-rule pp-new__rule"
      aria-hidden="true"
    />

    <form
      class="pp-new__form"
      novalidate
      @submit.prevent="onSubmit"
    >
      <div class="pp-new__field">
        <label
          for="session-title"
          class="small-caps pp-new__label"
          >Session title</label
        >
        <q-input
          id="session-title"
          v-model="form.title"
          placeholder="Dinner at Lusso"
          outlined
          :rules="[(val) => !!val || 'Give your session a title']"
          hide-bottom-space
        />
      </div>

      <div class="pp-new__field">
        <label
          for="session-date"
          class="small-caps pp-new__label"
          >Date</label
        >
        <q-input
          id="session-date"
          :model-value="displayDate()"
          outlined
          readonly
          :rules="[() => !!form.date || 'A date is required']"
          hide-bottom-space
          @click="showDatePicker = true"
        >
          <template #prepend>
            <q-icon
              name="event"
              class="cursor-pointer pp-new__icon"
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
      </div>

      <div class="pp-new__submit-row">
        <q-btn
          label="Create session"
          icon-right="arrow_forward"
          type="submit"
          color="primary"
          unelevated
          no-caps
          class="pp-new__submit"
          :loading="sessionStore.loading"
        />
        <q-btn
          label="Cancel"
          flat
          no-caps
          class="pp-new__cancel"
          to="/sessions"
        />
      </div>
    </form>

    <div
      class="pp-new__margin-numeral"
      aria-hidden="true"
    >
      03
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
  .pp-new {
    padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 2rem) 6rem;
    max-width: 640px;
    margin: 0 auto;
    position: relative;
  }

  .pp-new__header {
    margin-bottom: 1rem;
  }

  .pp-new__title {
    margin: 0.65rem 0 0.5rem;
    color: var(--ink);
  }

  .pp-new__sub {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.05rem;
    line-height: 1.55;
    color: var(--ink-soft);
    max-width: 44ch;
    font-variation-settings:
      'opsz' 20,
      'SOFT' 30;
  }

  .pp-new__rule {
    margin: 1.5rem 0 2rem;
  }

  .pp-new__form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .pp-new__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pp-new__label {
    color: var(--ink);
  }

  :deep(.pp-new__icon) {
    color: var(--rouge);
  }

  .pp-new__submit-row {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  :deep(.pp-new__submit) {
    padding: 0.85rem 1.5rem;
    font-family: var(--font-sans);
    font-weight: 500;
  }

  :deep(.pp-new__cancel) {
    color: var(--ink-mute);

    &:hover {
      color: var(--ink);
    }
  }

  .pp-new__margin-numeral {
    position: absolute;
    right: -1rem;
    bottom: 2rem;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 14rem;
    line-height: 1;
    color: var(--rouge);
    opacity: 0.05;
    pointer-events: none;
    font-variation-settings:
      'opsz' 144,
      'SOFT' 100;

    @media (max-width: 640px) {
      display: none;
    }
  }
</style>
