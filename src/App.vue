<script setup lang="ts">
import { ref } from 'vue';
import BaseButton from './components/ui/buttons/BaseButton.vue';
import BaseInput from './components/ui/inputs/BaseInput.vue';
import BaseModal from './components/ui/modals/BaseModal.vue';
import ConfirmDialog from './components/common/ConfirmDialog.vue';
import LoadingSpinner from './components/common/LoadingSpinner.vue';

const username = ref('');
const isModalOpen = ref(false);
const open = ref(false);

const handleDelete = () => {
  open.value = false;
};
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <BaseInput label="Username" placeholder="Enter your username" v-model="username" type="number"/>
  <BaseButton variant="primary" size="md" @click="isModalOpen = true">Primary Button</BaseButton>

  <BaseModal :open="isModalOpen" @close="isModalOpen = false" title="Hello Modal">
    <p>This is a modal content.</p>
  </BaseModal>


   <BaseButton
    variant="danger"
    @click="open = true"
  >
    Delete Student
  </BaseButton>

  <ConfirmDialog
    :open="open"
    title="Delete Student"
    message="This action cannot be undone. Are you sure you want to delete this student?"
    confirm-text="Delete"
    cancel-text="Cancel"
    danger
    @confirm="handleDelete"
    @cancel="open = false"
    @close="open = false"
  />

  <LoadingSpinner size="md" text="Loading..." />
</template>
<style scoped></style>
