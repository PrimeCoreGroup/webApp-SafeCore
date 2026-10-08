<script setup lang="ts">
import type { Component } from "vue";

export type BadgeTone = "danger" | "warning" | "success" | "info" | "neutral";

defineProps<{ tone: BadgeTone; icon?: Component }>();

const tones: Record<BadgeTone, string> = {
  danger: "bg-red-50 text-[#C71F1F] border-red-200",
  warning: "bg-amber-50 text-[#945B00] border-amber-200",
  success: "bg-emerald-50 text-[#00883A] border-emerald-200",
  info: "bg-blue-50 text-brand-dark border-blue-200",
  neutral: "bg-slate-50 text-slate-600 border-slate-200",
};
</script>

<template>
  <span
    :class="['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', tones[tone]]"
  >
    <component :is="icon" v-if="icon" class="size-3.5" aria-hidden="true" />
    <slot />
  </span>
</template>
