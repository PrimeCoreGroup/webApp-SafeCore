<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Bell, ChartColumn, FileText, Wifi } from "@lucide/vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import StatCard from "@/app/shared/components/ui/StatCard.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getResumenAnalitica, getTendencias } from "../../../data/analitica.service";
import SelectorPeriodo from "../../components/SelectorPeriodo.vue";
import { PERIODOS, type Periodo } from "../../models/analitica";

const router = useRouter();
const periodo = ref<Periodo>(30);

const { data: resumen, loading, error, reload } = useAsyncData(() => getResumenAnalitica(periodo.value));
const { data: tendencias, reload: recargarTendencias } = useAsyncData(() => getTendencias(periodo.value, "day"));

watch(periodo, () => {
  reload();
  recargarTendencias();
});

const maximo = computed(() => Math.max(1, ...(tendencias.value ?? []).map((p) => p.registradas)));

function etiquetaFecha(iso: string): string {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? iso : fecha.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

const indicadores = computed(() =>
  resumen.value
    ? [
        { etiqueta: "Alertas resueltas", valor: resumen.value.resueltasPct },
        { etiqueta: "Disponibilidad de nodos", valor: resumen.value.disponibilidadPct },
      ]
    : [],
);

function porcentaje(cantidad: number, total: number): number {
  return total ? Math.round((cantidad / total) * 100) : 0;
}
</script>

<template>
  <PageTitle title="Analítica" description="Indicadores clave del sistema y evolución operativa.">
    <template #action>
      <SelectorPeriodo v-model="periodo" :opciones="PERIODOS.map((p) => ({ valor: p.valor, etiqueta: p.etiqueta }))" etiqueta="Periodo" />
      <AppButton :icon="FileText" @click="router.push({ name: 'reportes' })">Consultar reportes</AppButton>
    </template>
  </PageTitle>

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="resumen">
      <div class="grid gap-4 sm:grid-cols-3">
        <StatCard label="Alertas en el periodo" :value="resumen.total" :detail="`Últimos ${periodo} días`" :icon="Bell" />
        <StatCard
          label="Tiempo de respuesta"
          :value="resumen.tiempoRespuestaMin === null ? '—' : `${Math.round(resumen.tiempoRespuestaMin)} min`"
          :detail="resumen.tiempoRespuestaMin === null ? 'Aún sin alertas resueltas' : 'Promedio del periodo'"
          :icon="ChartColumn"
          tone="green"
        />
        <StatCard
          label="Disponibilidad"
          :value="`${Math.round(resumen.disponibilidadPct)}%`"
          detail="Tiempo en línea de los nodos"
          :icon="Wifi"
          tone="green"
        />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <AppCard>
          <h2 class="text-lg font-bold">Resumen de actividad</h2>
          <p class="mt-1 text-sm text-muted">Alertas registradas por día</p>
          <p v-if="!tendencias?.length" class="mt-8 py-10 text-center text-sm text-muted">
            No hay alertas registradas en este periodo.
          </p>
          <template v-else>
            <div class="mt-8 flex h-52 items-end gap-2 border-b border-l border-slate-200 px-3">
              <div v-for="punto in tendencias" :key="punto.fecha" class="flex h-full flex-1 items-end">
                <div
                  class="w-full rounded-t bg-brand/80 transition-opacity hover:opacity-70"
                  :style="{ height: `${(punto.registradas / maximo) * 100}%` }"
                  :title="`${etiquetaFecha(punto.fecha)}: ${punto.registradas}`"
                />
              </div>
            </div>
            <div class="mt-2 flex justify-between text-xs text-muted">
              <span>{{ etiquetaFecha(tendencias[0]!.fecha) }}</span>
              <span>{{ etiquetaFecha(tendencias[tendencias.length - 1]!.fecha) }}</span>
            </div>
          </template>
        </AppCard>

        <AppCard>
          <h2 class="text-lg font-bold">Indicadores</h2>
          <div class="mt-5 space-y-6">
            <div v-for="indicador in indicadores" :key="indicador.etiqueta">
              <div class="mb-2 flex justify-between text-sm">
                <span class="text-muted">{{ indicador.etiqueta }}</span>
                <span class="font-bold">{{ Math.round(indicador.valor) }}%</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div class="h-2 rounded-full bg-brand" :style="{ width: `${Math.min(100, indicador.valor)}%` }" />
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <AppCard v-for="grupo in [{ titulo: 'Alertas por tipo', datos: resumen.porTipo }, { titulo: 'Alertas por severidad', datos: resumen.porSeveridad }]" :key="grupo.titulo">
          <h2 class="text-lg font-bold">{{ grupo.titulo }}</h2>
          <p v-if="!grupo.datos.length" class="mt-4 text-sm text-muted">Sin alertas en el periodo.</p>
          <div class="mt-5 space-y-5">
            <div v-for="dato in grupo.datos" :key="dato.clave">
              <div class="mb-2 flex justify-between text-sm">
                <span class="text-muted">{{ dato.etiqueta }}</span>
                <span class="font-bold">{{ dato.cantidad }}</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div class="h-2 rounded-full bg-brand" :style="{ width: `${porcentaje(dato.cantidad, resumen.total)}%` }" />
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </template>
  </LoadingState>
</template>
