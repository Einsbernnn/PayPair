<script setup lang="ts">
  withDefaults(
    defineProps<{
      title?: string;
      message?: string;
      confirmLabel?: string;
    }>(),
    {
      title: 'Are you sure?',
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
    },
  );

  const model = defineModel<boolean>({ default: false });
  const emit = defineEmits<{
    confirm: [];
  }>();

  function onConfirm() {
    emit('confirm');
    model.value = false;
  }
</script>

<template>
  <q-dialog
    :model-value="model"
    @update:model-value="model = $event"
  >
    <div class="pp-confirm">
      <div class="pp-confirm__seal" aria-hidden="true">
        <q-icon name="warning_amber" size="22px" />
      </div>
      <h3 class="pp-confirm__title">{{ title }}</h3>
      <p class="pp-confirm__message" v-html="message" />

      <div class="pp-confirm__actions">
        <q-btn
          label="Cancel"
          flat
          no-caps
          class="pp-confirm__cancel"
          @click="model = false"
        />
        <q-btn
          :label="confirmLabel"
          unelevated
          no-caps
          color="primary"
          class="pp-confirm__confirm"
          @click="onConfirm"
        />
      </div>
    </div>
  </q-dialog>
</template>

<style lang="scss" scoped>
  .pp-confirm {
    min-width: min(380px, 92vw);
    max-width: 440px;
    padding: clamp(1.5rem, 3vw, 2rem);
    background: var(--paper-deep);
    border: 1px solid var(--paper-edge);
    border-radius: 16px;
    box-shadow: var(--shadow-paper);
    text-align: center;
  }

  .pp-confirm__seal {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(165, 50, 30, 0.1);
    color: var(--rouge);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    border: 1px solid rgba(165, 50, 30, 0.3);
  }

  .pp-confirm__title {
    margin: 0 0 0.5rem;
    font-family: var(--font-serif);
    font-size: 1.35rem;
    font-weight: 500;
    color: var(--ink);
    font-variation-settings:
      'opsz' 32,
      'SOFT' 40;
  }

  .pp-confirm__message {
    margin: 0 0 1.5rem;
    font-family: var(--font-serif);
    font-size: 0.98rem;
    line-height: 1.5;
    color: var(--ink-soft);
    font-variation-settings:
      'opsz' 18,
      'SOFT' 40;
  }

  .pp-confirm__actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  :deep(.pp-confirm__cancel) {
    color: var(--ink-mute);
    padding: 0.7rem 1.1rem;
  }

  :deep(.pp-confirm__confirm) {
    padding: 0.7rem 1.25rem;
  }
</style>
