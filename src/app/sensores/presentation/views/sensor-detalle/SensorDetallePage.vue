<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { FlaskConical, Pencil } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { useToast } from "@/app/shared/composables/useToast";
import { getLecturasSensor, getSensor, probarSensor } from "../../../data/sensores.service";
import { SENSOR_ESTADO_UI, SENSOR_TIPOS } from "../../config/sensor-ui";
import type { Sensor } from "../../models/sensor";

const route = useRoute();
const toast = useToast();
const id = route.params.id as string;

const { data: sensor, loading, error, reload } = useAsyncData(() => getSensor(id));
const { data: lecturas } = useAsyncData(() => getLecturasSensor(id));

const probando = ref(false);

async function probar() {
  probando.value = true;
  try {
    await probarSensor(id);
    toast.add({ type: "success", message: "Prueba ejecutada. Se registró en el historial sin generar alerta." });
  } catch (e) {
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo ejecutar la prueba" });
  } finally {
    probando.value = false;
  }
}

function umbral(s: Sensor): string {
  const unidad = SENSOR_TIPOS[s.tipo].unidad;
  if (!unidad) return "No aplica";
  if (s.umbralMin === null && s.umbralMax === null) return "Sin configurar";
  const min = s.umbralMin === null ? "—" : `${s.umbralMin} ${unidad}`;
  const max = s.umbralMax === null ? "—" : `${s.umbralMax} ${unidad}`;
  return `${min} a ${max}`;
}

function filas(s: Sensor): [string, string][] {
  return [
    ["Tipo", SENSOR_TIPOS[s.tipo].descripcion],
    ["Estado", SENSOR_ESTADO_UI[s.estado].label],
    ["Conectividad", s.conectividad],
    ["Ubicación", `${s.inmuebleNombre} · ${s.zonaNombre}`],
    ["Nodo Edge", s.nodoNombre],
    ["Última lectura", s.ultimaLectura ?? "Sin lectura"],
    ["Última comunicación", s.ultimaComunicacion],
    ["Umbrales", umbral(s)],
    ["Identificador", s.id],
  ];
}
</script>

<template>
  <BackButton :to="{ name: 'sensores' }" />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="sensor">
      <PageTitle :title="sensor.nombre" :description="`${sensor.zonaNombre} · ${sensor.inmuebleNombre}`">
        <template #action>
          <AppButton variant="secondary" :icon="FlaskConical" :loading="probando" @click="probar">Probar</AppButton>
          <RouterLink :to="{ name: 'sensor-editar', params: { id: sensor.id } }">
            <AppButton :icon="Pencil" tabindex="-1">Editar</AppButton>
          </RouterLink>
        </template>
      </PageTitle>

      <div class="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div class="space-y-6">
          <AppCard>
            <div class="grid place-items-center rounded-xl bg-blue-50 py-10 text-brand-dark">
              <component :is="SENSOR_TIPOS[sensor.tipo].icono" class="size-20" aria-hidden="true" />
            </div>
            <div class="mt-5 flex items-center justify-between">
              <div>
                <p class="font-bold">{{ sensor.nombre }}</p>
                <p class="text-sm text-muted">{{ SENSOR_TIPOS[sensor.tipo].descripcion }}</p>
              </div>
              <AppBadge :tone="SENSOR_ESTADO_UI[sensor.estado].tone" :icon="SENSOR_ESTADO_UI[sensor.estado].icon">
                {{ SENSOR_ESTADO_UI[sensor.estado].label }}
              </AppBadge>
            </div>
          </AppCard>

          <AppCard v-if="lecturas?.length">
            <h2 class="text-lg font-bold">Lecturas recientes</h2>
            <ul class="mt-3 divide-y divide-slate-100">
              <li v-for="lectura in lecturas" :key="lectura.fecha" class="flex justify-between py-3 text-sm">
                <span class="text-muted">{{ lectura.fecha }}</span>
                <span class="font-semibold">{{ lectura.valor }}</span>
              </li>
            </ul>
          </AppCard>
        </div>

        <AppCard>
          <h2 class="text-lg font-bold">Información principal</h2>
          <dl class="mt-5 divide-y divide-slate-100">
            <div v-for="[term, value] in filas(sensor)" :key="term" class="grid grid-cols-2 gap-4 py-4 text-sm">
              <dt class="text-muted">{{ term }}</dt>
              <dd class="text-right font-semibold">{{ value }}</dd>
            </div>
          </dl>
        </AppCard>
      </div>
    </template>
  </LoadingState>
</template>
