<script setup lang="ts">
  withDefaults(
    defineProps<{
      title?: string;
      message?: string;
    }>(),
    {
      title: 'Confirm',
      message: 'Are you sure?',
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
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>
      <q-card-section>{{ message }}</q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          @click="model = false"
        />
        <q-btn
          flat
          label="Confirm"
          color="negative"
          @click="onConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
