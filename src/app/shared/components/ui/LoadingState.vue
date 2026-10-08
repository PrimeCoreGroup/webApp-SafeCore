<script setup lang="ts">
import { LoaderCircle, TriangleAlert } from "@lucide/vue";
import AppButton from "./AppButton.vue";

defineProps<{ loading: boolean; error?: string | null }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center gap-3 py-16 text-sm text-muted" role="status">
    <LoaderCircle class="size-5 animate-spin" aria-hidden="true" />
    Cargando…
  </div>
  <div v-else-if="error" class="flex flex-col items-center gap-3 py-16 text-center">
    <TriangleAlert class="size-8 text-danger" aria-hidden="true" />
    <p class="text-sm text-muted">{{ error }}</p>
    <AppButton variant="secondary" @click="$emit('retry')">Reintentar</AppButton>
  </div>
  <slot v-else />
</template>
