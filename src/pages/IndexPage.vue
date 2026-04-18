<script setup lang="ts">
  import { useAuthStore } from 'src/stores/useAuthStore';

  const authStore = useAuthStore();
</script>

<template>
  <q-page padding>
    <div class="q-gutter-md">
      <div class="text-h5">Welcome, {{ authStore.user?.email }}</div>
      <p class="text-body1 text-grey-7">You're signed in. Use the tabs below to manage sessions.</p>

      <div class="row q-gutter-sm">
        <q-btn
          label="Go to Sessions"
          color="primary"
          icon="receipt_long"
          to="/sessions"
        />
        <q-btn
          label="New Session"
          color="secondary"
          icon="add_circle"
          to="/sessions/new"
        />
      </div>
    </div>
  </q-page>
</template>
