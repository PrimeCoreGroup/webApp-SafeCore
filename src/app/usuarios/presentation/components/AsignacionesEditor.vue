<script setup lang="ts">
import { Plus, Trash2 } from "@lucide/vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getInmuebles } from "@/app/ubicaciones/data/ubicaciones.service";
import type { Asignacion } from "../models/usuario";

const props = defineProps<{ zonaObligatoria: boolean; error?: string }>();
const model = defineModel<Asignacion[]>({ required: true });

const { data: inmuebles, loading } = useAsyncData(getInmuebles);

function agregar() {
  model.value = [...model.value, { inmuebleId: "", zonaId: null }];
}

function quitar(indice: number) {
  model.value = model.value.filter((_, i) => i !== indice);
}

function cambiarInmueble(indice: number, inmuebleId: string) {
  model.value = model.value.map((a, i) => (i === indice ? { inmuebleId, zonaId: null } : a));
}

function cambiarZona(indice: number, zonaId: string) {
  model.value = model.value.map((a, i) => (i === indice ? { ...a, zonaId: zonaId || null } : a));
}

function zonasDe(inmuebleId: string) {
  return inmuebles.value?.find((i) => i.id === inmuebleId)?.zonas ?? [];
}
</script>

<template>
  <div>
    <p v-if="loading" class="text-sm text-muted">Cargando inmuebles…</p>
    <p v-else-if="!inmuebles?.length" class="rounded-lg bg-slate-50 p-4 text-sm text-muted">
      Aún no hay inmuebles. Créalos en Ubicaciones para poder asignarlos.
    </p>

    <template v-else>
      <p v-if="!model.length" class="mb-3 text-sm text-muted">Sin asignaciones.</p>
      <ul class="space-y-3">
        <li v-for="(asignacion, indice) in model" :key="indice" class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <select
            :value="asignacion.inmuebleId"
            :class="inputClass"
            :aria-label="`Inmueble de la asignación ${indice + 1}`"
            @change="cambiarInmueble(indice, ($event.target as HTMLSelectElement).value)"
          >
            <option value="" disabled>Selecciona un inmueble</option>
            <option v-for="inmueble in inmuebles" :key="inmueble.id" :value="inmueble.id">{{ inmueble.nombre }}</option>
          </select>
          <select
            :value="asignacion.zonaId ?? ''"
            :disabled="!asignacion.inmuebleId"
            :class="inputClass"
            :aria-label="`Zona de la asignación ${indice + 1}`"
            @change="cambiarZona(indice, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">{{ props.zonaObligatoria ? "Selecciona una zona" : "Todo el inmueble" }}</option>
            <option v-for="zona in zonasDe(asignacion.inmuebleId)" :key="zona.id" :value="zona.id">{{ zona.nombre }}</option>
          </select>
          <button
            type="button"
            :aria-label="`Quitar asignación ${indice + 1}`"
            class="grid size-11 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-red-50 hover:text-danger"
            @click="quitar(indice)"
          >
            <Trash2 class="size-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
      <div class="mt-3">
        <AppButton variant="secondary" :icon="Plus" @click="agregar">Agregar asignación</AppButton>
      </div>
    </template>

    <p v-if="error" class="mt-2 text-xs font-medium text-danger">{{ error }}</p>
  </div>
</template>
