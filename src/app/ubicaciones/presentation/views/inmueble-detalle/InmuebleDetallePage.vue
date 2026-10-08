<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import { ChevronRight, CircleCheck, Cpu, MapPin, TriangleAlert } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import StatCard from "@/app/shared/components/ui/StatCard.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getInmueble } from "../../../data/ubicaciones.service";
import { ESTADO_UBICACION_UI } from "../../config/ubicacion-ui";

const route = useRoute();
const { data: inmueble, loading, error, reload } = useAsyncData(() => getInmueble(route.params.inmuebleId as string));
</script>

<template>
  <BackButton :to="{ name: 'ubicaciones' }" />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="inmueble">
      <PageTitle :title="inmueble.nombre" :description="`${inmueble.direccion} · Edificio supervisado`" mock />

      <div class="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Estado"
          :value="ESTADO_UBICACION_UI[inmueble.estado].label"
          :detail="inmueble.estado === 'operativo' ? 'Sin incidencias' : 'Hay dispositivos que requieren atención'"
          :icon="inmueble.estado === 'operativo' ? CircleCheck : TriangleAlert"
          :tone="inmueble.estado === 'operativo' ? 'green' : 'amber'"
        />
        <StatCard
          label="Zonas"
          :value="inmueble.zonas.length"
          detail="Zonas supervisadas"
          :icon="MapPin"
        />
        <StatCard
          label="Dispositivos"
          :value="inmueble.dispositivos"
          :detail="`${inmueble.dispositivosConectados} conectados`"
          :icon="Cpu"
        />
      </div>

      <AppCard>
        <h2 class="text-lg font-bold text-ink">Zonas del edificio</h2>
        <p v-if="!inmueble.zonas.length" class="mt-4 text-sm text-muted">Este inmueble aún no tiene zonas.</p>
        <div class="mt-4 divide-y divide-slate-100">
          <RouterLink
            v-for="zona in inmueble.zonas"
            :key="zona.id"
            :to="{ name: 'zona-detalle', params: { inmuebleId: inmueble.id, zonaId: zona.id } }"
            class="flex w-full items-center gap-4 py-4 hover:bg-blue-50/40"
          >
            <span class="grid size-10 place-items-center rounded-lg bg-blue-50 text-brand-dark">
              <MapPin class="size-5" aria-hidden="true" />
            </span>
            <span class="flex-1">
              <span class="block text-sm font-semibold">{{ zona.nombre }}</span>
              <span class="block text-xs text-muted">{{ zona.dispositivos }} dispositivos</span>
            </span>
            <AppBadge :tone="ESTADO_UBICACION_UI[zona.estado].tone" :icon="ESTADO_UBICACION_UI[zona.estado].icon">
              {{ ESTADO_UBICACION_UI[zona.estado].label }}
            </AppBadge>
            <ChevronRight class="size-4 text-slate-400" aria-hidden="true" />
          </RouterLink>
        </div>
      </AppCard>
    </template>
  </LoadingState>
</template>
