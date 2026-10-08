<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { LoaderCircle, TriangleAlert } from "@lucide/vue";
import AppButton from "./AppButton.vue";

const props = defineProps<{ loading: boolean; error?: string | null }>();
defineEmits<{ retry: [] }>();

// Avisa si la carga tarda (el servidor puede estar despertando)
const slow = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.loading,
  (loading) => {
    slow.value = false;
    clearTimeout(timer);
    if (loading) timer = setTimeout(() => (slow.value = true), 5000);
  },
  { immediate: true },
);

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted" role="status">
    <span class="flex items-center gap-3">
      <LoaderCircle class="size-5 animate-spin" aria-hidden="true" />
      Cargando…
    </span>
    <span v-if="slow" class="text-xs">El servidor puede tardar unos segundos en responder.</span>
  </div>
  <div v-else-if="error" class="flex flex-col items-center gap-3 py-16 text-center">
    <TriangleAlert class="size-8 text-danger" aria-hidden="true" />
    <p class="text-sm text-muted">{{ error }}</p>
    <AppButton variant="secondary" @click="$emit('retry')">Reintentar</AppButton>
  </div>
  <slot v-else />
</template>
