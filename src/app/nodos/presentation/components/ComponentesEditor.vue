<script setup lang="ts">
import { Minus, Plus } from "@lucide/vue";
import { ACTUADOR_TIPOS, ACTUADOR_UI, SENSOR_TIPOS, SENSOR_UI } from "../config/nodo-ui";
import type { ComponentesNodo } from "../models/nodo";

const model = defineModel<ComponentesNodo>({ required: true });

type Clave = keyof ComponentesNodo;

function cantidad(clave: Clave, tipo: string): number {
  return (model.value[clave] as string[]).filter((t) => t === tipo).length;
}

function cambiar(clave: Clave, tipo: string, delta: 1 | -1) {
  const lista = [...(model.value[clave] as string[])];
  if (delta === 1) lista.push(tipo);
  else {
    const indice = lista.lastIndexOf(tipo);
    if (indice >= 0) lista.splice(indice, 1);
  }
  model.value = { ...model.value, [clave]: lista } as ComponentesNodo;
}

const grupos = [
  { clave: "sensores" as Clave, titulo: "Sensores", tipos: SENSOR_TIPOS, ui: SENSOR_UI as Record<string, (typeof SENSOR_UI)[keyof typeof SENSOR_UI]> },
  { clave: "actuadores" as Clave, titulo: "Actuadores", tipos: ACTUADOR_TIPOS, ui: ACTUADOR_UI as Record<string, (typeof ACTUADOR_UI)[keyof typeof ACTUADOR_UI]> },
];
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <div v-for="grupo in grupos" :key="grupo.clave">
      <h3 class="mb-3 text-sm font-semibold text-body">{{ grupo.titulo }}</h3>
      <ul class="divide-y divide-slate-100 rounded-lg border border-slate-200">
        <li v-for="tipo in grupo.tipos" :key="tipo" class="flex items-center gap-3 px-3 py-2.5">
          <component :is="grupo.ui[tipo]!.icono" class="size-5 text-slate-500" aria-hidden="true" />
          <span class="flex-1 text-sm">{{ grupo.ui[tipo]!.label }}</span>
          <button
            type="button"
            :aria-label="`Quitar ${grupo.ui[tipo]!.label}`"
            :disabled="cantidad(grupo.clave, tipo) === 0"
            class="grid size-8 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            @click="cambiar(grupo.clave, tipo, -1)"
          >
            <Minus class="size-4" aria-hidden="true" />
          </button>
          <span class="w-5 text-center text-sm font-semibold">{{ cantidad(grupo.clave, tipo) }}</span>
          <button
            type="button"
            :aria-label="`Agregar ${grupo.ui[tipo]!.label}`"
            class="grid size-8 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
            @click="cambiar(grupo.clave, tipo, 1)"
          >
            <Plus class="size-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
