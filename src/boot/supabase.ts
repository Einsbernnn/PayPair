import { defineBoot } from '#q-app/wrappers';
import { supabase } from 'src/services/supabase';
import { useAuthStore } from 'src/stores/useAuthStore';

export default defineBoot(async () => {
  const { error } = await supabase.auth.getSession();

  if (error) {
    console.error('Supabase connection failed:', error.message);
  }

  const authStore = useAuthStore();
  await authStore.init();
});
