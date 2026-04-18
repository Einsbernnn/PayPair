<script setup lang="ts">
  withDefaults(
    defineProps<{
      icon?: string;
      title?: string;
      message?: string;
      actionLabel?: string;
      actionTo?: string;
    }>(),
    {
      icon: 'inbox',
      title: '',
      message: 'Nothing here yet.',
      actionLabel: '',
      actionTo: '',
    },
  );
</script>

<template>
  <div class="pp-empty">
    <div class="pp-empty__mark">
      <q-icon
        :name="icon"
        size="28px"
      />
    </div>
    <h3
      v-if="title"
      class="pp-empty__title"
    >
      {{ title }}
    </h3>
    <p class="pp-empty__message">{{ message }}</p>
    <q-btn
      v-if="actionLabel && actionTo"
      unelevated
      no-caps
      :label="actionLabel"
      icon-right="arrow_forward"
      color="primary"
      class="pp-empty__btn"
      :to="actionTo"
    />
  </div>
</template>

<style lang="scss" scoped>
  .pp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: clamp(2rem, 6vw, 3.5rem) 1.5rem;
    max-width: 26rem;
    margin: 0 auto;
  }

  .pp-empty__mark {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 1px dashed var(--dust);
    background: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rouge);
    margin-bottom: 1.25rem;
  }

  .pp-empty__title {
    margin: 0 0 0.4rem;
    font-family: var(--font-serif);
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--ink);
    letter-spacing: -0.01em;
    font-variation-settings:
      'opsz' 32,
      'SOFT' 30;
  }

  .pp-empty__message {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1rem;
    font-style: italic;
    line-height: 1.5;
    color: var(--ink-mute);
    font-variation-settings:
      'opsz' 18,
      'SOFT' 50;
  }

  :deep(.pp-empty__btn) {
    margin-top: 1.25rem;
    padding: 0.7rem 1.25rem;
  }
</style>
