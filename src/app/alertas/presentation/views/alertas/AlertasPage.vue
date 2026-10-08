<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { ChevronRight } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getAlertas } from "../../../data/alertas.service";
import { ESTADO_ALERTA_LABEL, SEVERIDAD_UI } from "../../config/alerta-ui";
import type { EstadoAlerta } from "../../models/alerta";

const { data: alertas, loading, error, reload } = useAsyncData(getAlertas);

const filtro = ref<EstadoAlerta | "todas">("todas");
const opciones: { value: EstadoAlerta | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "activa", label: "Activas" },
  { value: "resuelta", label: "Resueltas" },
  { value: "archivada", label: "Archivadas" },
];

const filtradas = computed(() =>
  (alertas.value ?? []).filter((a) => filtro.value === "todas" || a.estado === filtro.value),
);
</script>

<template>
  <PageTitle title="Alertas" description="Eventos y notificaciones del sistema." />

  <div class="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
    <button
      v-for="opcion in opciones"
      :key="opcion.value"
      type="button"
      :aria-pressed="filtro === opcion.value"
      :class="[
        'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
        filtro === opcion.value
          ? 'border-brand bg-brand text-white'
          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
      ]"
      @click="filtro = opcion.value"
    >
      {{ opcion.label }}
    </button>
  </div>

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <AppCard flush>
      <div
        class="hidden grid-cols-[1.25fr_.8fr_1.25fr_.75fr_.9fr_1fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted xl:grid"
      >
        <span>Evento</span>
        <span>Severidad</span>
        <span>Ubicación</span>
        <span>Estado</span>
        <span>Fecha / hora</span>
        <span>Dispositivo</span>
        <span />
      </div>

      <p v-if="!filtradas.length" class="px-5 py-10 text-center text-sm text-muted">No hay alertas para mostrar.</p>

      <RouterLink
        v-for="alerta in filtradas"
        :key="alerta.id"
        :to="{ name: 'alerta-detalle', params: { id: alerta.id } }"
        class="grid gap-3 border-b border-slate-100 px-5 py-5 last:border-0 hover:bg-blue-50/40 sm:grid-cols-2 xl:grid-cols-[1.25fr_.8fr_1.25fr_.75fr_.9fr_1fr_auto] xl:items-center"
      >
        <span class="flex items-center gap-2 text-sm font-semibold">
          <component
            :is="SEVERIDAD_UI[alerta.severidad].icon"
            :class="['size-4', SEVERIDAD_UI[alerta.severidad].iconClass]"
            aria-hidden="true"
          />
          {{ alerta.evento }}
        </span>
        <span>
          <AppBadge :tone="SEVERIDAD_UI[alerta.severidad].tone" :icon="SEVERIDAD_UI[alerta.severidad].icon">
            {{ SEVERIDAD_UI[alerta.severidad].label }}
          </AppBadge>
        </span>
        <span class="text-sm text-muted">{{ alerta.ubicacion }}</span>
        <span class="text-sm font-semibold">{{ ESTADO_ALERTA_LABEL[alerta.estado] }}</span>
        <span class="text-sm text-muted">{{ alerta.fecha }}</span>
        <span class="text-sm">{{ alerta.dispositivo }}</span>
        <span class="inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">
          Ver detalles
          <ChevronRight class="size-4" aria-hidden="true" />
        </span>
      </RouterLink>
    </AppCard>
  </LoadingState>
</template>
