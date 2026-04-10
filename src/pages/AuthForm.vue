<script setup lang="ts">
import { reactive } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const form = reactive({
  email: '',
  password: '',
  remember: false
})

function onSubmit() {
  if (!form.email || !form.password) {
    $q.notify({
      type: 'negative',
      message: 'Email and password are required.'
    })
    return
  }

  $q.notify({
    type: 'positive',
    message: 'Login form submitted.'
  })

  console.log('Submitted', { ...form })
}

function onProviderLogin(provider: 'Google' | 'GitHub') {
  $q.notify({
    message: provider,
    caption: `Login with ${provider}`,
    color: 'primary',
    position: 'top'
  })
}
</script>

<template>
  <q-page class="row justify-center q-pa-md">
    <q-card class="col-12 col-sm-10 col-md-6 col-lg-4 q-pa-md">
      <q-card-section>
        <div class="text-h5">Login</div>
        <div class="text-caption text-grey-7">Enter your credentials to access your account.</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            autocomplete="email"
            outlined
            dense
            lazy-rules
            :rules="[(val) => !!val || 'Email is required']"
          />

          <q-input
            v-model="form.password"
            label="Password"
            type="password"
            autocomplete="current-password"
            outlined
            dense
            lazy-rules
            :rules="[(val) => !!val || 'Password is required', (val) => val.length >= 8 || 'Must be at least 8 characters']"
          />

          <q-checkbox v-model="form.remember" label="Remember me" />

          <q-btn label="Login" type="submit" color="primary" class="full-width" />
        </q-form>
      </q-card-section>

      <q-separator spaced />

      <q-card-section class="row q-col-gutter-sm">
        <div class="col-6">
          <q-btn
            label="Google"
            outline
            color="primary"
            class="full-width"
            @click="onProviderLogin('Google')"
          />
        </div>
        <div class="col-6">
          <q-btn
            label="GitHub"
            outline
            color="dark"
            class="full-width"
            @click="onProviderLogin('GitHub')"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

