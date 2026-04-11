<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import type { Session } from 'src/types';
  import ConfirmDialog from 'src/components/ConfirmDialog.vue';

  const props = defineProps<{
    session: Session;
  }>();

  const emit = defineEmits<{
    delete: [id: string];
  }>();

  const router = useRouter();
  const showDeleteDialog = ref(false);

  function goToSession() {
    void router.push(`/sessions/${props.session.id}`);
  }

  function onConfirmDelete() {
    emit('delete', props.session.id);
  }
</script>

<template>
  <q-card>
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-subtitle1 text-weight-medium">{{ session.title }}</div>
          <div class="text-caption text-grey">{{ session.date }}</div>
        </div>
        <q-badge
          :color="session.status === 'active' ? 'green' : 'grey'"
          :label="session.status"
          class="q-mr-sm"
        />
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn
        flat
        dense
        icon="open_in_new"
        label="Open"
        color="primary"
        @click="goToSession"
      />
      <q-btn
        flat
        dense
        icon="delete"
        label="Delete"
        color="negative"
        @click="showDeleteDialog = true"
      />
    </q-card-actions>

    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Session"
      :message="`Are you sure you want to delete &quot;${session.title}&quot;? This cannot be undone.`"
      @confirm="onConfirmDelete"
    />
  </q-card>
</template>
