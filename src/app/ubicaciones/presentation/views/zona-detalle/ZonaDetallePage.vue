<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import { ChevronRight } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { SENSOR_ESTADO_UI, SENSOR_TIPOS } from "@/app/sensores/presentation/config/sensor-ui";
import { getZona } from "../../../data/ubicaciones.service";
import { ESTADO_UBICACION_UI } from "../../config/ubicacion-ui";

const route = useRoute();
const inmuebleId = route.params.inmuebleId as string;
const { data, loading, error, reload } = useAsyncData(() => getZona(inmuebleId, route.params.zonaId as string));
</script>

<template>
  <BackButton :to="{ name: 'inmueble-detalle', params: { inmuebleId } }" />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="data">
      <PageTitle :title="data.zona.nombre" :description="`${data.inmueble.nombre} · Zona supervisada`" />

      <AppCard>
        <div class="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-lg font-bold">Dispositivos de la zona</h2>
            <p class="mt-1 text-sm text-muted">{{ data.sensores.length }} dispositivos registrados</p>
          </div>
          <AppBadge
            :tone="ESTADO_UBICACION_UI[data.zona.estado].tone"
            :icon="ESTADO_UBICACION_UI[data.zona.estado].icon"
          >
            {{ data.zona.estado === "operativo" ? "Zona operativa" : "Zona con atención" }}
          </AppBadge>
        </div>

        <p v-if="!data.sensores.length" class="py-8 text-center text-sm text-muted">
          Esta zona aún no tiene dispositivos.
        </p>

        <div class="mt-2 divide-y divide-slate-100">
          <RouterLink
            v-for="sensor in data.sensores"
            :key="sensor.id"
            :to="{ name: 'sensor-detalle', params: { id: sensor.id } }"
            class="flex w-full items-center gap-4 py-4 hover:bg-blue-50/40"
          >
            <span class="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
              <component :is="SENSOR_TIPOS[sensor.tipo].icono" class="size-5" aria-hidden="true" />
            </span>
            <span class="flex-1">
              <span class="block text-sm font-semibold">{{ sensor.nombre }}</span>
              <span class="block text-xs text-muted">{{ SENSOR_TIPOS[sensor.tipo].descripcion }}</span>
            </span>
            <AppBadge :tone="SENSOR_ESTADO_UI[sensor.estado].tone" :icon="SENSOR_ESTADO_UI[sensor.estado].icon">
              {{ SENSOR_ESTADO_UI[sensor.estado].label }}
            </AppBadge>
            <ChevronRight class="size-4 text-slate-400" aria-hidden="true" />
          </RouterLink>
        </div>
      </AppCard>
    </template>
  </LoadingState>
</template>
