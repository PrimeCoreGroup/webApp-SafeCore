<script setup lang="ts">
import { useRouter, type RouteLocationRaw } from "vue-router";
import { ChartColumn, FileText } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getReportes } from "../../../data/analitica.service";

const router = useRouter();
const { data: reportes, loading, error, reload } = useAsyncData(getReportes);

// Cada reporte se consulta en la pantalla que muestra sus datos
const DESTINOS: Record<string, { ruta: RouteLocationRaw; accion: string }> = {
  "alerts-summary": { ruta: { name: "analitica" }, accion: "Ver resumen de alertas" },
  "device-status": { ruta: { name: "nodos" }, accion: "Ver estado de nodos" },
  operations: { ruta: { name: "tendencias" }, accion: "Ver actividad operativa" },
};
</script>

<template>
  <BackButton :to="{ name: 'analitica' }" />
  <PageTitle title="Reportes" description="Reportes disponibles del sistema." />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <p v-if="!reportes?.length" class="py-10 text-center text-sm text-muted">No hay reportes disponibles.</p>
    <div class="grid gap-4 md:grid-cols-3">
      <AppCard v-for="reporte in reportes" :key="reporte.id">
        <div class="flex items-start justify-between">
          <span class="grid size-11 place-items-center rounded-lg bg-blue-50 text-brand-dark">
            <FileText class="size-5" aria-hidden="true" />
          </span>
          <AppBadge tone="neutral">{{ reporte.formato.toUpperCase() }}</AppBadge>
        </div>
        <h2 class="mt-5 font-bold">{{ reporte.nombre }}</h2>
        <p class="mt-2 text-sm leading-6 text-muted">{{ reporte.descripcion }}</p>
        <div v-if="DESTINOS[reporte.id]" class="mt-5">
          <AppButton variant="secondary" :icon="ChartColumn" @click="router.push(DESTINOS[reporte.id]!.ruta)">
            {{ DESTINOS[reporte.id]!.accion }}
          </AppButton>
        </div>
      </AppCard>
    </div>
  </LoadingState>
</template>
