<script setup lang="ts">
import type { Component } from "vue";
import AppCard from "./AppCard.vue";

type Tone = "blue" | "red" | "green" | "amber";

withDefaults(
  defineProps<{ label: string; value: string | number; detail: string; icon: Component; tone?: Tone }>(),
  { tone: "blue" },
);

const tones: Record<Tone, string> = {
  blue: "bg-blue-50 text-brand-dark",
  red: "bg-red-50 text-danger",
  green: "bg-emerald-50 text-success",
  amber: "bg-amber-50 text-amber-700",
};
</script>

<template>
  <AppCard>
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-muted">{{ label }}</p>
        <p class="mt-2 text-3xl font-bold text-ink">{{ value }}</p>
        <p class="mt-1 text-xs text-muted">{{ detail }}</p>
      </div>
      <span :class="['grid size-11 place-items-center rounded-xl', tones[tone]]">
        <component :is="icon" class="size-5" aria-hidden="true" />
      </span>
    </div>
  </AppCard>
</template>
