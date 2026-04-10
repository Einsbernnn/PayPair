import { defineBoot } from '#q-app/wrappers';
import { supabase } from 'src/services/supabase';

export default defineBoot(() => {
  // Ensure Supabase client is initialized during app boot.
  void supabase;
});
