<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>{{ appName }}</q-toolbar-title>
        <q-btn
          v-if="authStore.isLoggedIn"
          flat
          dense
          round
          icon="logout"
          @click="authStore.logout"
        />
        <q-btn
          v-else
          flat
          label="Sign In"
          to="/auth"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated>
      <q-tabs
        v-model="activeTab"
        class="bg-primary text-white"
        active-color="white"
        indicator-color="white"
        align="justify"
        narrow-indicator
      >
        <q-route-tab
          name="home"
          to="/"
          icon="home"
          label="Home"
        />
        <q-route-tab
          name="sessions"
          to="/sessions"
          icon="receipt_long"
          label="Sessions"
        />
        <q-route-tab
          name="add"
          to="/sessions/new"
          icon="add_circle"
          label="New Session"
        />
        <q-route-tab
          name="settings"
          to="/settings"
          icon="settings"
          label="Settings"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { APP_NAME } from '../constants/app';
  import { useAuthStore } from 'src/stores/useAuthStore';

  const appName = APP_NAME;
  const activeTab = ref('home');
  const authStore = useAuthStore();
</script>
