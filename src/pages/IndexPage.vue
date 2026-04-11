<script setup lang="ts">
  import { useAuthStore } from 'src/stores/useAuthStore';

  const authStore = useAuthStore();
</script>

<template>
  <q-page padding>
    <div
      v-if="authStore.isLoggedIn"
      class="q-gutter-md"
    >
      <div class="text-h5">Welcome, {{ authStore.user?.email }}</div>
      <p class="text-body1 text-grey-7">You're signed in. Use the tabs below to manage sessions.</p>
      <q-btn
        label="Sign Out"
        color="negative"
        outline
        @click="authStore.logout"
      />
    </div>

    <div
      v-else
      class="flex flex-center column q-pa-xl q-gutter-md"
    >
      <q-icon
        name="account_balance_wallet"
        size="64px"
        color="primary"
      />
      <div class="text-h5 text-center">Welcome to PairPay</div>
      <p class="text-body1 text-grey-7 text-center">
        Plan your dates, split the costs, and keep things fair.
      </p>
      <q-btn
        label="Sign In"
        color="primary"
        to="/auth"
      />
    </div>
  </q-page>
</template>
