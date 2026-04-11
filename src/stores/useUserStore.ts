import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const displayName = ref('');

  function saveDisplayName() {
    localStorage.setItem('paypair_display_name', displayName.value);
  }

  function loadDisplayName() {
    displayName.value = localStorage.getItem('paypair_display_name') ?? '';
  }

  loadDisplayName();

  return { displayName, saveDisplayName, loadDisplayName };
});
