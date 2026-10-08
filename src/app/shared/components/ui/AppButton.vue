<script setup lang="ts">
import type { Component } from "vue";
import { cn } from "@/app/components/ui/utils";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "danger" | "ghost";
    icon?: Component;
    type?: "button" | "submit";
    disabled?: boolean;
    loading?: boolean;
  }>(),
  { variant: "primary", type: "button" },
);

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-sm",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-danger text-white hover:bg-red-700",
  ghost: "text-slate-600 hover:bg-slate-100",
};
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :class="
      cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60',
        variants[props.variant],
      )
    "
  >
    <component :is="props.icon" v-if="props.icon" class="size-4" aria-hidden="true" />
    <slot />
  </button>
</template>
