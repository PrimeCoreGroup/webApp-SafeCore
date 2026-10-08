<script setup lang="ts">
import { cn } from "@/app/components/ui/utils";

withDefaults(defineProps<{ flush?: boolean }>(), { flush: false });
</script>

<template>
  <section
    :class="
      cn(
        'rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        flush ? 'overflow-hidden p-0' : 'p-5',
      )
    "
  >
    <slot />
  </section>
</template>
