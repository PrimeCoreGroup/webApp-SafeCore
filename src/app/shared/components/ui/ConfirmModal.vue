<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { CircleCheck, Info, TriangleAlert } from "@lucide/vue";
import AppButton from "./AppButton.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    tone?: "danger" | "success" | "info";
    confirmLabel?: string;
    cancelLabel?: string;
    // oculta el botón de cancelar
    hideCancel?: boolean;
    loading?: boolean;
  }>(),
  { tone: "danger", confirmLabel: "Aceptar", cancelLabel: "Cancelar" },
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();

const icon = computed(() => ({ danger: TriangleAlert, success: CircleCheck, info: Info })[props.tone]);
const iconTone = computed(
  () =>
    ({
      danger: "bg-red-50 text-danger",
      success: "bg-emerald-50 text-success",
      info: "bg-blue-50 text-brand-dark",
    })[props.tone],
);

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("cancel");
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5"
    @mousedown.self="emit('cancel')"
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
    >
      <span :class="['grid size-12 place-items-center rounded-full', iconTone]">
        <component :is="icon" class="size-6" aria-hidden="true" />
      </span>
      <h2 id="modal-title" class="mt-5 text-xl font-bold text-ink">{{ title }}</h2>
      <div class="mt-2 text-sm leading-6 text-muted"><slot /></div>
      <div class="mt-7 flex justify-end gap-3">
        <AppButton v-if="!hideCancel" variant="secondary" @click="emit('cancel')">{{ cancelLabel }}</AppButton>
        <AppButton :variant="tone === 'danger' ? 'danger' : 'primary'" :loading="loading" @click="emit('confirm')">
          {{ confirmLabel }}
        </AppButton>
      </div>
    </section>
  </div>
</template>
