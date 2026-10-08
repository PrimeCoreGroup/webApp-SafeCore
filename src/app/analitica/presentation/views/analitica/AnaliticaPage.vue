<script setup lang="ts">
import { useRouter } from "vue-router";
import { Bell, ChartColumn, FileText, Wifi } from "@lucide/vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import StatCard from "@/app/shared/components/ui/StatCard.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getResumenAnalitica } from "../../../data/analitica.service";

const router = useRouter();
const { data: resumen, loading, error, reload } = useAsyncData(getResumenAnalitica);
</script>

<template>
  <PageTitle title="Analítica" description="Indicadores clave del sistema y evolución operativa." mock>
    <template #action>
      <AppButton :icon="FileText" @click="router.push({ name: 'reportes' })">Consultar reportes</AppButton>
    </template>
  </PageTitle>

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="resumen">
      <div class="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Alertas este periodo"
          :value="resumen.alertasPeriodo"
          :detail="resumen.tendenciaAlertas"
          :icon="Bell"
        />
        <StatCard
          label="Tiempo de respuesta"
          :value="`${resumen.tiempoRespuestaMin} min`"
          detail="Promedio del periodo"
          :icon="ChartColumn"
          tone="green"
        />
        <StatCard
          label="Disponibilidad"
          :value="`${resumen.disponibilidad}%`"
          detail="Dispositivos operativos"
          :icon="Wifi"
          tone="green"
        />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <AppCard>
          <h2 class="text-lg font-bold">Resumen de actividad</h2>
          <p class="mt-1 text-sm text-muted">Eventos registrados durante el periodo</p>
          <div class="mt-8 flex h-52 items-end gap-3 border-b border-l border-slate-200 px-4">
            <div v-for="(altura, i) in resumen.actividad" :key="i" class="flex h-full flex-1 items-end">
              <div
                class="w-full rounded-t bg-brand/80 transition-opacity hover:opacity-70"
                :style="{ height: `${altura}%` }"
              />
            </div>
          </div>
          <div class="mt-2 flex justify-between text-xs text-muted">
            <span>Inicio</span>
            <span>Periodo actual</span>
          </div>
        </AppCard>

        <AppCard>
          <h2 class="text-lg font-bold">Indicadores</h2>
          <div class="mt-5 space-y-6">
            <div v-for="indicador in resumen.indicadores" :key="indicador.label">
              <div class="mb-2 flex justify-between text-sm">
                <span class="text-muted">{{ indicador.label }}</span>
                <span class="font-bold">{{ indicador.valor }}%</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div class="h-2 rounded-full bg-brand" :style="{ width: `${indicador.valor}%` }" />
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </template>
  </LoadingState>
</template>
