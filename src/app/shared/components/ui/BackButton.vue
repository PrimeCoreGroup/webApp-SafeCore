<script setup lang="ts">
import { ArrowLeft } from "@lucide/vue";
import { RouterLink, type RouteLocationRaw } from "vue-router";

defineProps<{ to: RouteLocationRaw }>();
</script>

<template>
  <RouterLink
    :to="to"
    class="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:underline"
  >
    <ArrowLeft class="size-4" aria-hidden="true" />
    Volver
  </RouterLink>
</template>
