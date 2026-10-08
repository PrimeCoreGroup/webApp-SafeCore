<script setup lang="ts">
defineProps<{ title: string; description?: string; mock?: boolean }>();
</script>

<template>
  <div class="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <h1 class="flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight text-ink">
        {{ title }}
        <span
          v-if="mock"
          class="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-[#945B00]"
          title="El backend aún no tiene endpoints para esta sección"
        >
          Datos de ejemplo
        </span>
      </h1>
      <p v-if="description" class="mt-2 text-sm text-muted">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="flex items-center gap-3">
      <slot name="action" />
    </div>
  </div>
</template>
