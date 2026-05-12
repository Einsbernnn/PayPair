<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useQuasar } from 'quasar';
  import { useRouter } from 'vue-router';
  import pkg from '../../package.json';
  import { useAuthStore } from 'src/stores/useAuthStore';
  import { useSessionStore } from 'src/stores/useSessionStore';
  import { fetchUserData, downloadAsJson } from 'src/services/dataExportService';
  import ConfirmDialog from 'src/components/ConfirmDialog.vue';

  const $q = useQuasar();
  const router = useRouter();
  const authStore = useAuthStore();
  const sessionStore = useSessionStore();

  const draftName = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const showPassword = ref(false);

  const savingProfile = ref(false);
  const savingPassword = ref(false);
  const exporting = ref(false);
  const wiping = ref(false);
  const globalSigningOut = ref(false);

  const wipeConfirmOpen = ref(false);
  const signOutAllConfirmOpen = ref(false);

  const appVersion = pkg.version;

  const initials = computed(() => {
    const source = authStore.fullName || authStore.email;
    if (!source) return '·';
    const parts = source.split(/[\s@]+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase() || source[0]?.toUpperCase() || '·';
  });

  const providerLabel = computed(() => {
    switch (authStore.provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      case 'email':
        return 'Email & password';
      default:
        return authStore.provider;
    }
  });

  const providerIcon = computed(() => {
    switch (authStore.provider) {
      case 'google':
        return 'fab fa-google';
      case 'github':
        return 'fab fa-github';
      default:
        return 'mail_outline';
    }
  });

  const memberSinceLabel = computed(() => {
    if (!authStore.memberSince) return '—';
    return new Date(authStore.memberSince).toLocaleDateString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    });
  });

  const isStandalone = ref(false);
  const installLabel = computed(() => (isStandalone.value ? 'Installed' : 'Browser'));

  const sessionCount = computed(() => sessionStore.sessions.length);
  const expenseCount = computed(() => sessionStore.expenses.length);

  onMounted(async () => {
    draftName.value = authStore.fullName;
    isStandalone.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (sessionStore.sessions.length === 0) {
      await sessionStore.fetchSessions();
    }
  });

  async function handleSaveProfile() {
    const name = draftName.value.trim();
    if (!name) {
      $q.notify({ type: 'negative', message: 'Display name cannot be empty.' });
      return;
    }
    savingProfile.value = true;
    try {
      await authStore.saveProfile(name);
      $q.notify({ type: 'positive', message: 'Profile saved.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not save profile.';
      $q.notify({ type: 'negative', message: msg });
    } finally {
      savingProfile.value = false;
    }
  }

  async function handleChangePassword() {
    if (newPassword.value.length < 8) {
      $q.notify({ type: 'negative', message: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      $q.notify({ type: 'negative', message: 'Passwords do not match.' });
      return;
    }
    savingPassword.value = true;
    try {
      await authStore.changePassword(newPassword.value);
      newPassword.value = '';
      confirmPassword.value = '';
      $q.notify({ type: 'positive', message: 'Password updated.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not update password.';
      $q.notify({ type: 'negative', message: msg });
    } finally {
      savingPassword.value = false;
    }
  }

  async function handleExport() {
    exporting.value = true;
    try {
      const bundle = await fetchUserData(appVersion);
      downloadAsJson(bundle);
      $q.notify({ type: 'positive', message: 'Export ready — check your downloads.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed.';
      $q.notify({ type: 'negative', message: msg });
    } finally {
      exporting.value = false;
    }
  }

  async function handleWipe() {
    wiping.value = true;
    try {
      const n = await sessionStore.deleteAllSessions();
      $q.notify({
        type: 'positive',
        message: n === 0 ? 'Nothing to delete.' : `Deleted ${n} session${n === 1 ? '' : 's'}.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not delete sessions.';
      $q.notify({ type: 'negative', message: msg });
    } finally {
      wiping.value = false;
    }
  }

  async function handleSignOutEverywhere() {
    globalSigningOut.value = true;
    try {
      await authStore.logoutEverywhere();
      await router.push('/auth');
      $q.notify({ type: 'info', message: 'Signed out on all devices.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not sign out everywhere.';
      $q.notify({ type: 'negative', message: msg });
    } finally {
      globalSigningOut.value = false;
    }
  }

  async function handleSignOut() {
    await authStore.logout();
    await router.push('/auth');
  }

  function copyEmail() {
    if (!authStore.email) return;
    void navigator.clipboard.writeText(authStore.email);
    $q.notify({ type: 'info', message: 'Email copied to clipboard.', timeout: 1200 });
  }
</script>

<template>
  <q-page class="pp-settings">
    <header class="pp-settings__head">
      <div class="eyebrow">Section IV</div>
      <h1 class="display-lg pp-settings__title">Settings</h1>
      <p class="pp-settings__lede">
        Manage your account, secure your sign-in, and keep your ledger in order.
      </p>
    </header>

    <div class="dotted-rule pp-settings__rule" aria-hidden="true" />

    <!-- ─────────── Account ─────────── -->
    <section class="pp-section">
      <div class="pp-section__head">
        <div class="pp-section__num">01</div>
        <div>
          <div class="small-caps pp-section__kicker">Account</div>
          <h2 class="pp-section__title">Who you are</h2>
        </div>
      </div>

      <div class="pp-card">
        <div class="pp-identity">
          <div class="pp-identity__seal" aria-hidden="true">{{ initials }}</div>
          <div class="pp-identity__body">
            <div class="pp-identity__name">{{ authStore.fullName || 'Unnamed traveller' }}</div>
            <button
              type="button"
              class="pp-identity__email"
              :title="authStore.email"
              @click="copyEmail"
            >
              {{ authStore.email }}
              <q-icon name="content_copy" size="13px" class="pp-identity__copy" />
            </button>
          </div>
        </div>

        <dl class="pp-meta">
          <div class="pp-meta__row">
            <dt>Signed in via</dt>
            <dd>
              <q-icon :name="providerIcon" size="14px" class="pp-meta__icon" />
              {{ providerLabel }}
            </dd>
          </div>
          <div class="pp-meta__row">
            <dt>Member since</dt>
            <dd>{{ memberSinceLabel }}</dd>
          </div>
        </dl>

        <div class="pp-field">
          <label for="display-name" class="pp-field__label">Display name</label>
          <q-input
            id="display-name"
            v-model="draftName"
            outlined
            dense
            placeholder="What should we call you?"
            class="pp-input"
            @keyup.enter="handleSaveProfile"
          />
          <p class="pp-field__hint">
            Shown on receipts and in your sessions. Synced to your Supabase profile.
          </p>
        </div>

        <div class="pp-actions">
          <q-btn
            label="Save changes"
            unelevated
            no-caps
            color="primary"
            class="pp-actions__primary"
            :loading="savingProfile"
            @click="handleSaveProfile"
          />
        </div>
      </div>
    </section>

    <!-- ─────────── Security ─────────── -->
    <section class="pp-section">
      <div class="pp-section__head">
        <div class="pp-section__num">02</div>
        <div>
          <div class="small-caps pp-section__kicker">Security</div>
          <h2 class="pp-section__title">Keep it locked</h2>
        </div>
      </div>

      <div class="pp-card">
        <template v-if="authStore.isEmailUser">
          <div class="pp-field">
            <label for="new-password" class="pp-field__label">New password</label>
            <q-input
              id="new-password"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              placeholder="At least 8 characters"
              class="pp-input"
            >
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <div class="pp-field">
            <label for="confirm-password" class="pp-field__label">Confirm new password</label>
            <q-input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              placeholder="Type it again"
              class="pp-input"
              @keyup.enter="handleChangePassword"
            />
          </div>

          <div class="pp-actions">
            <q-btn
              label="Update password"
              unelevated
              no-caps
              color="primary"
              class="pp-actions__primary"
              :loading="savingPassword"
              :disable="!newPassword || !confirmPassword"
              @click="handleChangePassword"
            />
          </div>

          <div class="dotted-rule pp-card__rule" aria-hidden="true" />
        </template>

        <div v-else class="pp-callout">
          <q-icon name="info" size="18px" class="pp-callout__icon" />
          <span>
            You signed in with <strong>{{ providerLabel }}</strong> — manage your password in that
            provider, not here.
          </span>
        </div>

        <div class="pp-row">
          <div class="pp-row__body">
            <div class="pp-row__title">Sign out everywhere</div>
            <p class="pp-row__sub">
              Revokes every session for this account across all devices. Useful if a phone goes
              missing or you signed in on a friend's laptop.
            </p>
          </div>
          <q-btn
            label="Sign out all"
            outline
            no-caps
            class="pp-row__btn"
            :loading="globalSigningOut"
            @click="signOutAllConfirmOpen = true"
          />
        </div>

        <div class="dotted-rule pp-card__rule" aria-hidden="true" />

        <div class="pp-row">
          <div class="pp-row__body">
            <div class="pp-row__title">Sign out</div>
            <p class="pp-row__sub">Just this device.</p>
          </div>
          <q-btn
            label="Sign out"
            flat
            no-caps
            class="pp-row__btn pp-row__btn--ghost"
            @click="handleSignOut"
          />
        </div>
      </div>
    </section>

    <!-- ─────────── Data ─────────── -->
    <section class="pp-section">
      <div class="pp-section__head">
        <div class="pp-section__num">03</div>
        <div>
          <div class="small-caps pp-section__kicker">Your data</div>
          <h2 class="pp-section__title">Take it with you</h2>
        </div>
      </div>

      <div class="pp-card">
        <div class="pp-counts">
          <div class="pp-counts__item">
            <div class="pp-counts__num">{{ sessionCount }}</div>
            <div class="pp-counts__label">Sessions</div>
          </div>
          <div class="pp-counts__sep" aria-hidden="true" />
          <div class="pp-counts__item">
            <div class="pp-counts__num">{{ expenseCount }}</div>
            <div class="pp-counts__label">Expenses</div>
          </div>
        </div>

        <div class="dotted-rule pp-card__rule" aria-hidden="true" />

        <div class="pp-row">
          <div class="pp-row__body">
            <div class="pp-row__title">Export everything as JSON</div>
            <p class="pp-row__sub">
              Downloads all your sessions, expenses, splits, and participants in a single file.
            </p>
          </div>
          <q-btn
            label="Export"
            icon="file_download"
            outline
            no-caps
            class="pp-row__btn"
            :loading="exporting"
            @click="handleExport"
          />
        </div>

        <div class="dotted-rule pp-card__rule" aria-hidden="true" />

        <div class="pp-row pp-row--danger">
          <div class="pp-row__body">
            <div class="pp-row__title">Delete every session</div>
            <p class="pp-row__sub">
              Wipes every session, expense, and split owned by this account. Cannot be undone.
            </p>
          </div>
          <q-btn
            label="Delete all"
            icon="delete_sweep"
            outline
            no-caps
            class="pp-row__btn pp-row__btn--danger"
            :disable="sessionCount === 0"
            :loading="wiping"
            @click="wipeConfirmOpen = true"
          />
        </div>
      </div>
    </section>

    <!-- ─────────── About ─────────── -->
    <section class="pp-section">
      <div class="pp-section__head">
        <div class="pp-section__num">04</div>
        <div>
          <div class="small-caps pp-section__kicker">About</div>
          <h2 class="pp-section__title">The fine print</h2>
        </div>
      </div>

      <div class="pp-card">
        <dl class="pp-meta">
          <div class="pp-meta__row">
            <dt>Version</dt>
            <dd>{{ appVersion }}</dd>
          </div>
          <div class="pp-meta__row">
            <dt>Running as</dt>
            <dd>{{ installLabel }}</dd>
          </div>
          <div class="pp-meta__row">
            <dt>Currency</dt>
            <dd>Philippine Peso (₱)</dd>
          </div>
        </dl>

        <div class="pp-colophon">
          PayPair is a small, paper-feeling utility for splitting shared expenses.
          Built with Vue, Quasar, and Supabase.
        </div>
      </div>
    </section>

    <ConfirmDialog
      v-model="wipeConfirmOpen"
      title="Delete every session?"
      :message="`This permanently removes <strong>${sessionCount}</strong> session${
        sessionCount === 1 ? '' : 's'
      } and all expenses inside them. There is no undo.`"
      confirm-label="Yes, delete everything"
      @confirm="handleWipe"
    />

    <ConfirmDialog
      v-model="signOutAllConfirmOpen"
      title="Sign out on every device?"
      message="You'll need to sign in again here and on any other browser or phone that was logged in to this account."
      confirm-label="Sign out everywhere"
      @confirm="handleSignOutEverywhere"
    />
  </q-page>
</template>

<style lang="scss" scoped>
  .pp-settings {
    padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 2rem) 6rem;
    max-width: 720px;
    margin: 0 auto;
  }

  .pp-settings__head {
    .eyebrow {
      color: var(--rouge);
    }
  }

  .pp-settings__title {
    margin: 0.55rem 0 0.75rem;
    color: var(--ink);
  }

  .pp-settings__lede {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1rem, 1.8vw, 1.1rem);
    line-height: 1.55;
    color: var(--ink-soft);
    max-width: 50ch;
    font-variation-settings:
      'opsz' 18,
      'SOFT' 40;
  }

  .pp-settings__rule {
    margin: 1.75rem 0 2.25rem;
  }

  /* ─── Section heads ─── */
  .pp-section {
    margin-bottom: 2.5rem;
  }

  .pp-section__head {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .pp-section__num {
    flex: 0 0 auto;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--rouge);
    letter-spacing: 0.08em;
    margin-top: 0.4rem;
  }

  .pp-section__kicker {
    color: var(--ink-mute);
    margin-bottom: 0.2rem;
  }

  .pp-section__title {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.45rem;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.15;
    font-variation-settings:
      'opsz' 36,
      'SOFT' 50;
  }

  /* ─── Cards ─── */
  .pp-card {
    padding: clamp(1.25rem, 3vw, 1.75rem);
    background: var(--paper-deep);
    border: 1px solid var(--paper-edge);
    border-radius: 14px;
  }

  .pp-card__rule {
    margin: 1.25rem 0;
  }

  /* ─── Identity block ─── */
  .pp-identity {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .pp-identity__seal {
    flex: 0 0 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(165, 50, 30, 0.18), rgba(232, 203, 168, 0.55));
    border: 1px solid rgba(165, 50, 30, 0.3);
    color: var(--rouge);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-serif);
    font-weight: 500;
    font-size: 1.35rem;
    letter-spacing: 0.02em;
    font-variation-settings:
      'opsz' 36,
      'SOFT' 50;
  }

  .pp-identity__name {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.2;
    font-variation-settings:
      'opsz' 28,
      'SOFT' 40;
  }

  .pp-identity__email {
    margin-top: 0.2rem;
    background: none;
    border: none;
    padding: 0;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--ink-mute);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: color 120ms ease;

    &:hover {
      color: var(--rouge);
    }
  }

  .pp-identity__copy {
    opacity: 0.55;
  }

  /* ─── Definition list ─── */
  .pp-meta {
    margin: 0 0 1.25rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .pp-meta__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
    font-family: var(--font-sans);

    dt {
      font-size: 0.72rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--ink-mute);
    }

    dd {
      margin: 0;
      font-size: 0.92rem;
      color: var(--ink);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
  }

  .pp-meta__icon {
    color: var(--ink-soft);
  }

  /* ─── Forms ─── */
  .pp-field {
    margin-bottom: 1rem;
  }

  .pp-field__label {
    display: block;
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-mute);
    margin-bottom: 0.4rem;
  }

  .pp-field__hint {
    margin: 0.4rem 0 0;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.85rem;
    color: var(--ink-mute);
    font-variation-settings:
      'opsz' 14,
      'SOFT' 40;
  }

  :deep(.pp-input .q-field__control) {
    border-radius: 10px;
  }

  /* ─── Rows (sign-out, export, etc.) ─── */
  .pp-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;

    @media (max-width: 540px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .pp-row__body {
    flex: 1;
  }

  .pp-row__title {
    font-family: var(--font-serif);
    font-size: 1.02rem;
    color: var(--ink);
    font-variation-settings:
      'opsz' 22,
      'SOFT' 40;
  }

  .pp-row__sub {
    margin: 0.2rem 0 0;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    line-height: 1.45;
    color: var(--ink-soft);
  }

  :deep(.pp-row__btn) {
    align-self: flex-start;
    padding: 0.55rem 1rem;
    font-family: var(--font-sans);
    border-radius: 10px;
  }

  :deep(.pp-row__btn--ghost) {
    color: var(--ink-soft);
  }

  :deep(.pp-row__btn--danger) {
    color: var(--rouge);
    border-color: rgba(165, 50, 30, 0.35);

    &:hover:not(.disabled) {
      background: rgba(165, 50, 30, 0.08);
    }
  }

  .pp-row--danger .pp-row__title {
    color: var(--rouge);
  }

  /* ─── Counts strip ─── */
  .pp-counts {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 0.25rem;
  }

  .pp-counts__item {
    text-align: center;
    flex: 1;
  }

  .pp-counts__num {
    font-family: var(--font-serif);
    font-size: 2.25rem;
    line-height: 1;
    font-weight: 500;
    color: var(--ink);
    font-variation-settings:
      'opsz' 96,
      'SOFT' 30;
  }

  .pp-counts__label {
    margin-top: 0.35rem;
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }

  .pp-counts__sep {
    width: 1px;
    align-self: stretch;
    background: var(--paper-edge);
  }

  /* ─── Callout (non-email user) ─── */
  .pp-callout {
    padding: 0.85rem 1rem;
    background: rgba(165, 50, 30, 0.06);
    border: 1px solid rgba(165, 50, 30, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    font-family: var(--font-serif);
    font-size: 0.95rem;
    line-height: 1.45;
    color: var(--ink-soft);
    margin-bottom: 1.25rem;
    font-variation-settings:
      'opsz' 18,
      'SOFT' 40;

    strong {
      color: var(--ink);
      font-weight: 600;
    }
  }

  .pp-callout__icon {
    color: var(--rouge);
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* ─── Actions ─── */
  .pp-actions {
    display: flex;
    justify-content: flex-end;
  }

  :deep(.pp-actions__primary) {
    padding: 0.7rem 1.3rem;
    font-family: var(--font-sans);
    border-radius: 10px;
  }

  /* ─── Colophon ─── */
  .pp-colophon {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--paper-edge);
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.9rem;
    color: var(--ink-mute);
    line-height: 1.5;
    font-variation-settings:
      'opsz' 16,
      'SOFT' 40;
  }
</style>
