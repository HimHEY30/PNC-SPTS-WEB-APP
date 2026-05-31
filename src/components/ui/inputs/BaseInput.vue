<script setup lang="ts">
// Reusable input field that works with v-model
// Just pass a label, placeholder, and bind it with v-model like a normal input

interface Props {
  label?: string
  placeholder?: string
  type?: string
  modelValue: string
  error?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
})

// This is the standard pattern to make a custom component work with v-model
// Whenever the user types, we emit the new value back up to the parent
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="font-medium text-sm">
      {{ label }}
    </label>

    <input
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
    />

    <p v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </p>
  </div>
</template>