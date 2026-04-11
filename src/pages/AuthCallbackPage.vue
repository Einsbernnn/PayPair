<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { supabase } from 'src/services/supabase';

  const router = useRouter();

  onMounted(async () => {
    const { error } = await supabase.auth.getSession();
    if (error) console.error('Auth callback error:', error.message);
    await router.push('/');
  });
</script>

<template>
  <q-page class="flex flex-center">
    <q-spinner
      color="primary"
      size="50px"
    />
  </q-page>
</template>
