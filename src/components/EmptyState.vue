<script setup lang="ts">
  withDefaults(
    defineProps<{
      icon?: string;
      message?: string;
    }>(),
    {
      icon: 'inbox',
      message: 'Nothing here yet.',
    },
  );
</script>

<template>
  <div class="flex flex-center column q-pa-xl text-grey-6">
    <q-icon
      :name="icon"
      size="64px"
      class="q-mb-md"
    />
    <div class="text-subtitle1">{{ message }}</div>
  </div>
</template>
