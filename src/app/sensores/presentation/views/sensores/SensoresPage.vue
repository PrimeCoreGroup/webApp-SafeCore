<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { CircleCheck, Cpu, Eye, Pencil, Plus, Search, Trash2, TriangleAlert } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import StatCard from "@/app/shared/components/ui/StatCard.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { useToast } from "@/app/shared/composables/useToast";
import { getInmuebles } from "@/app/ubicaciones/data/ubicaciones.service";
import { deleteSensor, getSensores } from "../../../data/sensores.service";
import { SENSOR_ESTADO_UI, SENSOR_TIPOS, SENSOR_TIPO_OPCIONES } from "../../config/sensor-ui";
import type { Sensor, SensorFiltros } from "../../models/sensor";

const router = useRouter();
const toast = useToast();

const { data: sensores, loading, error, reload } = useAsyncData(getSensores);
const { data: inmuebles } = useAsyncData(getInmuebles);

const filtros = reactive<SensorFiltros>({ busqueda: "", tipo: "", estado: "", inmuebleId: "" });

const filtrados = computed(() => {
  const texto = filtros.busqueda.trim().toLowerCase();
  return (sensores.value ?? []).filter(
    (s) =>
      (!texto || s.id.toLowerCase().includes(texto) || s.nombre.toLowerCase().includes(texto)) &&
      (!filtros.tipo || s.tipo === filtros.tipo) &&
      (!filtros.estado || s.estado === filtros.estado) &&
      (!filtros.inmuebleId || s.inmuebleId === filtros.inmuebleId),
  );
});

const total = computed(() => sensores.value?.length ?? 0);
const activos = computed(() => (sensores.value ?? []).filter((s) => s.estado === "activo").length);
const enAlerta = computed(() => (sensores.value ?? []).filter((s) => s.estado === "alerta").length);
const inactivos = computed(() => (sensores.value ?? []).filter((s) => s.estado === "inactivo").length);
const porcentajeOperativos = computed(() =>
  total.value ? `${((activos.value / total.value) * 100).toFixed(1).replace(".", ",")}% operativos` : "—",
);

const sensorAEliminar = ref<Sensor | null>(null);
const eliminando = ref(false);

async function confirmarEliminacion() {
  if (!sensorAEliminar.value) return;
  eliminando.value = true;
  try {
    await deleteSensor(sensorAEliminar.value.id);
    toast.add({ type: "success", message: `Sensor ${sensorAEliminar.value.id} eliminado` });
    sensorAEliminar.value = null;
    await reload();
  } catch (e) {
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo eliminar el sensor" });
  } finally {
    eliminando.value = false;
  }
}
</script>

<template>
  <PageTitle title="Sensores IoT" description="Supervisa y administra los sensores conectados a SafeCore.">
    <template #action>
      <AppButton :icon="Plus" @click="router.push({ name: 'sensor-nuevo' })">Registrar sensor</AppButton>
    </template>
  </PageTitle>

  <div class="mb-6 grid gap-4 sm:grid-cols-3">
    <StatCard label="Sensores registrados" :value="total" detail="Inventario total" :icon="Cpu" />
    <StatCard label="Sensores activos" :value="activos" :detail="porcentajeOperativos" :icon="CircleCheck" tone="green" />
    <StatCard
      label="Requieren atención"
      :value="enAlerta + inactivos"
      :detail="`${enAlerta} en alerta y ${inactivos} inactivo${inactivos === 1 ? '' : 's'}`"
      :icon="TriangleAlert"
      tone="red"
    />
  </div>

  <AppCard class="mb-4">
    <div class="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          v-model="filtros.busqueda"
          type="search"
          placeholder="Buscar por ID o nombre"
          aria-label="Buscar sensor"
          :class="[inputClass, 'pl-9']"
        />
      </div>
      <select v-model="filtros.tipo" aria-label="Filtrar por tipo" :class="inputClass">
        <option value="">Todos los tipos</option>
        <option v-for="tipo in SENSOR_TIPO_OPCIONES" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option>
      </select>
      <select v-model="filtros.estado" aria-label="Filtrar por estado" :class="inputClass">
        <option value="">Todos los estados</option>
        <option v-for="(ui, estado) in SENSOR_ESTADO_UI" :key="estado" :value="estado">{{ ui.label }}</option>
      </select>
      <select v-model="filtros.inmuebleId" aria-label="Filtrar por ubicación" :class="inputClass">
        <option value="">Todas las ubicaciones</option>
        <option v-for="inmueble in inmuebles ?? []" :key="inmueble.id" :value="inmueble.id">{{ inmueble.nombre }}</option>
      </select>
    </div>
  </AppCard>

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <AppCard flush>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[860px] text-left">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th class="px-5 py-3">ID</th>
              <th class="px-5 py-3">Sensor</th>
              <th class="px-5 py-3">Ubicación</th>
              <th class="px-5 py-3">Última lectura</th>
              <th class="px-5 py-3">Estado</th>
              <th class="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="sensor in filtrados" :key="sensor.id" class="hover:bg-blue-50/30">
              <td class="px-5 py-4 text-sm font-bold text-ink">{{ sensor.id }}</td>
              <td class="px-5 py-4">
                <span class="block text-sm font-semibold">{{ sensor.nombre }}</span>
                <span class="block text-xs text-muted">{{ SENSOR_TIPOS[sensor.tipo].descripcion }}</span>
              </td>
              <td class="px-5 py-4 text-sm text-muted">
                <span class="block">{{ sensor.inmuebleNombre }}</span>
                <span class="block text-xs">{{ sensor.zonaNombre }}</span>
              </td>
              <td
                :class="[
                  'px-5 py-4 text-sm',
                  sensor.estado === 'alerta' ? 'font-semibold text-red-700' : '',
                  sensor.ultimaLectura ? '' : 'text-muted',
                ]"
              >
                {{ sensor.ultimaLectura ?? "Sin lectura" }}
              </td>
              <td class="px-5 py-4">
                <AppBadge :tone="SENSOR_ESTADO_UI[sensor.estado].tone" :icon="SENSOR_ESTADO_UI[sensor.estado].icon">
                  {{ SENSOR_ESTADO_UI[sensor.estado].label }}
                </AppBadge>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <RouterLink
                    :to="{ name: 'sensor-detalle', params: { id: sensor.id } }"
                    :aria-label="`Ver detalle de ${sensor.id}`"
                    title="Ver detalle"
                    class="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <Eye class="size-4" aria-hidden="true" />
                  </RouterLink>
                  <RouterLink
                    :to="{ name: 'sensor-editar', params: { id: sensor.id } }"
                    :aria-label="`Editar ${sensor.id}`"
                    title="Editar"
                    class="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <Pencil class="size-4" aria-hidden="true" />
                  </RouterLink>
                  <button
                    type="button"
                    :aria-label="`Eliminar ${sensor.id}`"
                    title="Eliminar"
                    class="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-red-50 hover:text-danger"
                    @click="sensorAEliminar = sensor"
                  >
                    <Trash2 class="size-4" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtrados.length">
              <td colspan="6" class="px-5 py-12 text-center text-sm text-muted">
                {{ total ? "Ningún sensor coincide con los filtros." : "Aún no hay sensores registrados." }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>
  </LoadingState>

  <ConfirmModal
    v-if="sensorAEliminar"
    title="¿Eliminar sensor?"
    confirm-label="Eliminar"
    :loading="eliminando"
    @confirm="confirmarEliminacion"
    @cancel="sensorAEliminar = null"
  >
    <p>
      Se eliminará <strong>{{ sensorAEliminar.id }} · {{ sensorAEliminar.nombre }}</strong> del inventario. Esta
      acción no se puede deshacer.
    </p>
  </ConfirmModal>
</template>
