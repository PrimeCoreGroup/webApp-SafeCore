<script setup lang="ts">
defineProps<{ label: string; hint?: string; error?: string }>();
</script>

<template>
  <label class="block">
    <span class="mb-2 block text-sm font-semibold text-body">{{ label }}</span>
    <slot />
    <span v-if="error" class="mt-1.5 block text-xs font-medium text-danger">{{ error }}</span>
    <span v-else-if="hint" class="mt-1.5 block text-xs text-muted">{{ hint }}</span>
  </label>
</template>
