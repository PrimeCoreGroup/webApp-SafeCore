<script setup lang="ts">
defineProps<{ opciones: { valor: string | number; etiqueta: string }[]; etiqueta: string }>();
const model = defineModel<string | number>({ required: true });
</script>

<template>
  <div class="inline-flex rounded-lg border border-slate-300 bg-white p-0.5" role="group" :aria-label="etiqueta">
    <button
      v-for="opcion in opciones"
      :key="opcion.valor"
      type="button"
      :aria-pressed="model === opcion.valor"
      :class="[
        'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
        model === opcion.valor ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100',
      ]"
      @click="model = opcion.valor"
    >
      {{ opcion.etiqueta }}
    </button>
  </div>
</template>
