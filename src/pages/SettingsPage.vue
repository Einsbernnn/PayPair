<script setup lang="ts">
  import { useQuasar } from 'quasar';
  import { useUserStore } from 'src/stores/useUserStore';

  const $q = useQuasar();
  const userStore = useUserStore();

  function handleSave() {
    if (!userStore.displayName.trim()) {
      $q.notify({ type: 'negative', message: 'Display name cannot be empty.' });
      return;
    }
    userStore.saveDisplayName();
    $q.notify({ type: 'positive', message: 'Display name saved!' });
  }
</script>

<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Settings</div>

    <q-card>
      <q-card-section>
        <q-input
          v-model="userStore.displayName"
          label="Your Display Name"
          outlined
          dense
          @keyup.enter="handleSave"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Save"
          color="primary"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>
