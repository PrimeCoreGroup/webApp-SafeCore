<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Building2, Cpu, ShieldCheck, TriangleAlert, Wifi } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import StatCard from "@/app/shared/components/ui/StatCard.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { SEVERIDAD_UI } from "@/app/alertas/presentation/config/alerta-ui";
import { ESTADO_UBICACION_UI } from "@/app/ubicaciones/presentation/config/ubicacion-ui";
import { getDashboardData } from "../../../data/dashboard.service";

const { data, loading, error, reload } = useAsyncData(getDashboardData);

const actividadTone = {
  critica: "bg-red-50 text-danger",
  advertencia: "bg-amber-50 text-amber-700",
  informacion: "bg-blue-50 text-brand-dark",
};
</script>

<template>
  <PageTitle title="Panel principal" description="Resumen del estado operativo de SafeCore." />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="data">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Estado general"
          :value="data.estadoGeneral.operativo ? 'Operativo' : 'Atención'"
          :detail="data.estadoGeneral.detalle"
          :icon="ShieldCheck"
          :tone="data.estadoGeneral.operativo ? 'green' : 'amber'"
        />
        <StatCard
          label="Alertas activas"
          :value="data.alertasActivas.valor"
          :detail="data.alertasActivas.detalle"
          :icon="TriangleAlert"
          tone="red"
        />
        <StatCard label="Nodos" :value="data.nodos.valor" :detail="data.nodos.detalle" :icon="Cpu" />
        <StatCard
          label="Conectividad"
          :value="`${data.conectividad.valor}%`"
          :detail="data.conectividad.detalle"
          :icon="Wifi"
          tone="green"
        />
      </div>

      <div :class="['mt-6 grid gap-6', data.ubicaciones.length ? 'xl:grid-cols-[1.4fr_1fr]' : '']">
        <AppCard>
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-ink">Actividad reciente</h2>
              <p class="mt-1 text-sm text-muted">Eventos del sistema</p>
            </div>
            <RouterLink
              to="/alertas"
              class="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Ver alertas
            </RouterLink>
          </div>
          <p v-if="!data.actividadReciente.length" class="py-6 text-center text-sm text-muted">
            Sin actividad reciente.
          </p>
          <div class="divide-y divide-slate-100">
            <RouterLink
              v-for="item in data.actividadReciente"
              :key="item.id"
              :to="{ name: 'alerta-detalle', params: { id: item.id } }"
              class="flex items-center gap-4 py-4"
            >
              <span :class="['grid size-10 shrink-0 place-items-center rounded-full', actividadTone[item.severidad]]">
                <component :is="SEVERIDAD_UI[item.severidad].icon" class="size-5" aria-hidden="true" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-body">{{ item.titulo }}</p>
                <p class="truncate text-xs text-muted">{{ item.lugar }}</p>
              </div>
              <time class="text-xs text-muted">{{ item.tiempo }}</time>
            </RouterLink>
          </div>
        </AppCard>

        <AppCard v-if="data.ubicaciones.length">
          <h2 class="text-lg font-bold text-ink">Estado por ubicación</h2>
          <p class="mt-1 text-sm text-muted">Resumen de edificios supervisados</p>
          <div class="mt-5 space-y-4">
            <RouterLink
              v-for="ubicacion in data.ubicaciones"
              :key="ubicacion.id"
              :to="{ name: 'inmueble-detalle', params: { inmuebleId: ubicacion.id } }"
              class="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-blue-300 hover:bg-blue-50/30"
            >
              <span class="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-600">
                <Building2 class="size-5" aria-hidden="true" />
              </span>
              <span class="flex-1">
                <span class="block text-sm font-semibold">{{ ubicacion.nombre }}</span>
                <span class="block text-xs text-muted">
                  {{ ubicacion.nodosEnLinea }} / {{ ubicacion.nodos }} nodos
                </span>
              </span>
              <AppBadge
                :tone="ESTADO_UBICACION_UI[ubicacion.estado].tone"
                :icon="ESTADO_UBICACION_UI[ubicacion.estado].icon"
              >
                {{ ESTADO_UBICACION_UI[ubicacion.estado].label }}
              </AppBadge>
            </RouterLink>
          </div>
        </AppCard>
      </div>
    </template>
  </LoadingState>
</template>
