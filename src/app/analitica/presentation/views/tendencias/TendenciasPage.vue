<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Bell, ChartColumn, CircleCheck } from "@lucide/vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import StatCard from "@/app/shared/components/ui/StatCard.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getTendencias } from "../../../data/analitica.service";
import SelectorPeriodo from "../../components/SelectorPeriodo.vue";
import { INTERVALOS, PERIODOS, type Intervalo, type Periodo } from "../../models/analitica";

const periodo = ref<Periodo>(30);
const intervalo = ref<Intervalo>("day");

const { data: tendencias, loading, error, reload } = useAsyncData(() => getTendencias(periodo.value, intervalo.value));
watch([periodo, intervalo], reload);

const registradas = computed(() => (tendencias.value ?? []).reduce((suma, p) => suma + p.registradas, 0));
const atendidas = computed(() => (tendencias.value ?? []).reduce((suma, p) => suma + p.atendidas, 0));
const porcentajeAtendidas = computed(() => (registradas.value ? Math.round((atendidas.value / registradas.value) * 100) : 0));

// Área de trazado del SVG (viewBox 500x220)
const X0 = 30;
const X1 = 480;
const Y0 = 190;
const Y1 = 20;

const maximo = computed(() => Math.max(1, ...(tendencias.value ?? []).flatMap((p) => [p.registradas, p.atendidas])));

function puntos(valores: number[]): string {
  const paso = valores.length > 1 ? (X1 - X0) / (valores.length - 1) : 0;
  return valores
    .map((v, i) => `${(X0 + paso * i).toFixed(1)},${(Y0 - (v / maximo.value) * (Y0 - Y1)).toFixed(1)}`)
    .join(" ");
}

function etiquetaFecha(iso: string): string {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? iso : fecha.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}
</script>

<template>
  <BackButton :to="{ name: 'reportes' }" />
  <PageTitle title="Tendencias" description="Evolución de las alertas registradas y atendidas.">
    <template #action>
      <SelectorPeriodo v-model="periodo" :opciones="PERIODOS.map((p) => ({ valor: p.valor, etiqueta: p.etiqueta }))" etiqueta="Periodo" />
      <SelectorPeriodo v-model="intervalo" :opciones="INTERVALOS" etiqueta="Agrupar por" />
    </template>
  </PageTitle>

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <div v-if="tendencias" class="grid gap-6 lg:grid-cols-2">
      <AppCard>
        <h2 class="text-lg font-bold">Evolución de alertas</h2>
        <p class="mt-1 text-sm text-muted">Comparativa del periodo</p>
        <p v-if="!tendencias.length" class="mt-8 py-10 text-center text-sm text-muted">
          No hay alertas registradas en este periodo.
        </p>
        <template v-else>
          <svg class="mt-8 h-64 w-full" viewBox="0 0 500 220" role="img" aria-label="Gráfico de evolución de alertas">
            <path :d="`M${X0} ${Y0}H${X1}M${X0} ${Y1}V${Y0}`" stroke="#CBD5E1" fill="none" />
            <polyline
              :points="puntos(tendencias.map((p) => p.registradas))"
              fill="none"
              stroke="#1E90FF"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline
              :points="puntos(tendencias.map((p) => p.atendidas))"
              fill="none"
              stroke="#FFB84D"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <div class="flex justify-between text-xs text-muted">
            <span>{{ etiquetaFecha(tendencias[0]!.fecha) }}</span>
            <span>{{ etiquetaFecha(tendencias[tendencias.length - 1]!.fecha) }}</span>
          </div>
          <div class="mt-3 flex gap-5 text-xs text-muted">
            <span class="flex items-center gap-2"><i class="size-2.5 rounded-full bg-brand" />Alertas registradas</span>
            <span class="flex items-center gap-2"><i class="size-2.5 rounded-full bg-warning" />Alertas atendidas</span>
          </div>
        </template>
      </AppCard>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <StatCard label="Alertas registradas" :value="registradas" detail="Total del periodo" :icon="Bell" />
        <StatCard label="Alertas atendidas" :value="atendidas" detail="Reconocidas o resueltas" :icon="CircleCheck" tone="green" />
        <StatCard
          label="Porcentaje atendido"
          :value="`${porcentajeAtendidas}%`"
          detail="Atendidas sobre registradas"
          :icon="ChartColumn"
          tone="green"
        />
      </div>
    </div>
  </LoadingState>
</template>
