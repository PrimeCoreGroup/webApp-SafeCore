<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Building2, ChevronRight } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getInmuebles } from "../../../data/ubicaciones.service";
import { ESTADO_UBICACION_UI } from "../../config/ubicacion-ui";

const { data: inmuebles, loading, error, reload } = useAsyncData(getInmuebles);
</script>

<template>
  <PageTitle title="Ubicaciones" description="Edificios y espacios supervisados por SafeCore." />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <AppCard flush>
      <div
        class="hidden grid-cols-[1.4fr_1.4fr_1fr_1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted md:grid"
      >
        <span>Nombre</span>
        <span>Dirección</span>
        <span>Nodos</span>
        <span>Estado</span>
        <span>Acción</span>
      </div>

      <p v-if="!inmuebles?.length" class="px-5 py-10 text-center text-sm text-muted">
        Aún no hay inmuebles registrados.
      </p>

      <RouterLink
        v-for="inmueble in inmuebles"
        :key="inmueble.id"
        :to="{ name: 'inmueble-detalle', params: { inmuebleId: inmueble.id } }"
        class="grid gap-3 border-b border-slate-100 px-5 py-5 last:border-0 hover:bg-blue-50/40 md:grid-cols-[1.4fr_1.4fr_1fr_1fr_auto] md:items-center md:gap-4"
      >
        <span class="flex items-center gap-3 font-semibold">
          <span class="grid size-10 place-items-center rounded-lg bg-blue-50 text-brand-dark">
            <Building2 class="size-5" aria-hidden="true" />
          </span>
          {{ inmueble.nombre }}
        </span>
        <span class="text-sm text-muted">{{ inmueble.direccion }}</span>
        <span class="text-sm">{{ inmueble.nodos }} nodos</span>
        <span>
          <AppBadge :tone="ESTADO_UBICACION_UI[inmueble.estado].tone" :icon="ESTADO_UBICACION_UI[inmueble.estado].icon">
            {{ ESTADO_UBICACION_UI[inmueble.estado].label }}
          </AppBadge>
        </span>
        <span class="inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">
          Ver detalles
          <ChevronRight class="size-4" aria-hidden="true" />
        </span>
      </RouterLink>
    </AppCard>
  </LoadingState>
</template>
