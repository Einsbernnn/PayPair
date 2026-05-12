<template>
  <q-layout
    view="lHh Lpr lFf"
    class="pp-layout"
  >
    <q-header>
      <q-toolbar>
        <div class="pp-masthead">
          <div class="pp-masthead__mark">{{ appName }}</div>
          <div class="pp-masthead__sub">Shared expenses · settled simply</div>
        </div>

        <q-space />

        <InstallPwaButton />

        <q-btn
          v-if="authStore.isLoggedIn"
          flat
          dense
          round
          class="pp-header-btn"
          icon="logout"
          aria-label="Sign out"
          :loading="authStore.loading"
          @click="handleLogout"
        />
      </q-toolbar>
      <div
        class="dotted-rule"
        aria-hidden="true"
      />
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="showFooter">
      <div
        class="dotted-rule"
        aria-hidden="true"
      />
      <q-tabs
        v-model="activeTab"
        class="pp-tabs"
        active-color="rouge"
        indicator-color="rouge"
        align="justify"
        narrow-indicator
      >
        <q-route-tab
          name="home"
          to="/"
          exact
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
          name="new"
          to="/sessions/new"
          icon="add_circle_outline"
          label="New"
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
  import { ref, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { APP_NAME } from '../constants/app';
  import { useAuthStore } from 'src/stores/useAuthStore';
  import InstallPwaButton from 'src/components/InstallPwaButton.vue';

  const appName = APP_NAME;
  const activeTab = ref('home');
  const authStore = useAuthStore();
  const route = useRoute();
  const router = useRouter();

  const showFooter = computed(() => !route.path.startsWith('/auth') && authStore.isLoggedIn);

  async function handleLogout() {
    await authStore.logout();
    await router.push('/auth');
  }
</script>

<style lang="scss" scoped>
  .pp-masthead {
    display: flex;
    flex-direction: column;
    line-height: 1;

    &__mark {
      font-family: var(--font-serif);
      font-weight: 500;
      font-size: 1.5rem;
      letter-spacing: -0.02em;
      color: var(--ink);
      font-variation-settings:
        'opsz' 72,
        'SOFT' 40;
    }

    &__sub {
      margin-top: 4px;
      font-family: var(--font-sans);
      font-size: 0.63rem;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--ink-mute);
    }
  }

  .pp-header-btn {
    color: var(--ink-soft);

    &:hover {
      color: var(--rouge);
    }
  }
</style>
