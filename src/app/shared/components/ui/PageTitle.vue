<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template>
  <div class="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-ink">{{ title }}</h1>
      <p v-if="description" class="mt-2 text-sm text-muted">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="flex items-center gap-3">
      <slot name="action" />
    </div>
  </div>
</template>
