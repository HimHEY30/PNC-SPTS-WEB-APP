<script setup lang="ts">
import { computed } from 'vue'
const emit = defineEmits<{
    (e: 'click'): void
}>()
interface Props {
    variant?: 'primary' | 'secondary' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
})

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'secondary':
            return 'bg-gray-200 text-black hover:bg-gray-300'

        case 'danger':
            return 'bg-red-500 text-white hover:bg-red-600'

        default:
            return 'bg-blue-600 text-white hover:bg-blue-700'
    }
})

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'px-3 py-1 text-sm'

        case 'lg':
            return 'px-6 py-3 text-lg'

        default:
            return 'px-4 py-2'
    }
})
</script>

<template>
    <button @click="emit('click')" :type="type" :disabled="disabled || loading"
        class="rounded-lg font-medium transition duration-200 disabled:opacity-50"
        :class="[variantClasses, sizeClasses]">
        <span v-if="loading">Loading...</span>
        <slot v-else />
    </button>
</template>