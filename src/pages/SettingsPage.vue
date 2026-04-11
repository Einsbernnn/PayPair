<script setup lang="ts">
  import { useUserStore } from 'src/stores/useUserStore';

  const userStore = useUserStore();
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
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Save"
          color="primary"
          @click="userStore.saveDisplayName"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>
