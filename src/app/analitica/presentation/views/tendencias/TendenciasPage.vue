<script setup lang="ts">
import { ChartColumn, CircleCheck } from "@lucide/vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import StatCard from "@/app/shared/components/ui/StatCard.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getTendencias } from "../../../data/analitica.service";

const { data: tendencias, loading, error, reload } = useAsyncData(getTendencias);

// Área de trazado del SVG (viewBox 500x220)
const X0 = 30;
const X1 = 480;
const Y0 = 190;
const Y1 = 20;

function puntos(serie: number[], max: number): string {
  const paso = serie.length > 1 ? (X1 - X0) / (serie.length - 1) : 0;
  return serie
    .map((valor, i) => `${(X0 + paso * i).toFixed(1)},${(Y0 - (valor / max) * (Y0 - Y1)).toFixed(1)}`)
    .join(" ");
}
</script>

<template>
  <BackButton :to="{ name: 'reportes' }" />
  <PageTitle title="Tendencias" description="Evolución de los principales indicadores." mock />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <div v-if="tendencias" class="grid gap-6 lg:grid-cols-2">
      <AppCard>
        <h2 class="text-lg font-bold">Evolución de alertas</h2>
        <p class="mt-1 text-sm text-muted">Comparativa del periodo</p>
        <svg class="mt-8 h-64 w-full" viewBox="0 0 500 220" role="img" aria-label="Gráfico de evolución de alertas">
          <path :d="`M${X0} ${Y0}H${X1}M${X0} ${Y1}V${Y0}`" stroke="#CBD5E1" fill="none" />
          <polyline
            :points="puntos(tendencias.alertasRegistradas, 60)"
            fill="none"
            stroke="#1E90FF"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <polyline
            :points="puntos(tendencias.alertasAtendidas, 60)"
            fill="none"
            stroke="#FFB84D"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div class="flex gap-5 text-xs text-muted">
          <span class="flex items-center gap-2"><i class="size-2.5 rounded-full bg-brand" />Alertas registradas</span>
          <span class="flex items-center gap-2"><i class="size-2.5 rounded-full bg-warning" />Alertas atendidas</span>
        </div>
      </AppCard>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <StatCard
          label="Variación del periodo"
          :value="tendencias.variacionPeriodo"
          detail="Menos eventos registrados"
          :icon="ChartColumn"
          tone="green"
        />
        <StatCard
          label="Respuesta promedio"
          :value="`${tendencias.respuestaPromedioMin} min`"
          detail="Dentro del objetivo operativo"
          :icon="CircleCheck"
          tone="green"
        />
      </div>
    </div>
  </LoadingState>
</template>
