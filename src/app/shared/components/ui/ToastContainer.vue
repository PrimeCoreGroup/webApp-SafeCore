<script setup lang="ts">
import { CircleAlert, CircleCheck, Info } from "@lucide/vue";
import { useToast } from "@/app/shared/composables/useToast";

const { toasts } = useToast();

const icons = { success: CircleCheck, error: CircleAlert, info: Info };
const tones = { success: "bg-success", error: "bg-danger", info: "bg-brand" };
</script>

<template>
  <div class="pointer-events-none fixed bottom-6 right-5 z-[60] flex flex-col gap-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      role="status"
      class="pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-xl"
    >
      <span :class="['grid size-7 shrink-0 place-items-center rounded-full', tones[toast.type]]">
        <component :is="icons[toast.type]" class="size-4" aria-hidden="true" />
      </span>
      {{ toast.message }}
    </div>
  </div>
</template>
