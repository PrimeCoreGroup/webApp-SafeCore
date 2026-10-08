<script setup lang="ts">
defineProps<{ label: string }>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    class="flex w-full items-center justify-between gap-4 py-3 text-left"
    @click="model = !model"
  >
    <span class="text-sm font-medium">{{ label }}</span>
    <span :class="['relative h-6 w-11 rounded-full transition-colors', model ? 'bg-brand' : 'bg-slate-300']">
      <span
        :class="[
          'absolute top-1 size-4 rounded-full bg-white shadow-sm transition-all',
          model ? 'left-6' : 'left-1',
        ]"
      />
    </span>
  </button>
</template>
