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
import { deleteNodo, getNodos } from "../../../data/nodos.service";
import { NODO_ESTADO_UI } from "../../config/nodo-ui";
import type { Nodo, NodoFiltros } from "../../models/nodo";

const router = useRouter();
const toast = useToast();

const { data: nodos, loading, error, reload } = useAsyncData(getNodos);

const filtros = reactive<NodoFiltros>({ busqueda: "", estado: "" });

const filtrados = computed(() => {
  const texto = filtros.busqueda.trim().toLowerCase();
  return (nodos.value ?? []).filter(
    (n) =>
      (!texto || n.codigo.toLowerCase().includes(texto) || n.nombre.toLowerCase().includes(texto)) &&
      (!filtros.estado || n.estado === filtros.estado),
  );
});

const total = computed(() => nodos.value?.length ?? 0);
const enLinea = computed(() => (nodos.value ?? []).filter((n) => n.estado === "online").length);
const requierenAtencion = computed(
  () => (nodos.value ?? []).filter((n) => n.estado === "offline" || n.estado === "degraded").length,
);
const porcentajeEnLinea = computed(() =>
  total.value ? `${((enLinea.value / total.value) * 100).toFixed(1).replace(".", ",")}% en línea` : "—",
);
// La columna solo aparece cuando el backend informa quién registró el nodo
const muestraRegistrador = computed(() => (nodos.value ?? []).some((n) => n.registradoPor));

const nodoAEliminar = ref<Nodo | null>(null);
const eliminando = ref(false);

async function confirmarEliminacion() {
  if (!nodoAEliminar.value) return;
  eliminando.value = true;
  try {
    await deleteNodo(nodoAEliminar.value.id);
    toast.add({ type: "success", message: `Nodo ${nodoAEliminar.value.codigo} eliminado` });
    nodoAEliminar.value = null;
    await reload();
  } catch (e) {
    nodoAEliminar.value = null;
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo eliminar el nodo" });
  } finally {
    eliminando.value = false;
  }
}
</script>

<template>
  <PageTitle title="Nodos" description="Supervisa y administra los nodos instalados con SafeCore.">
    <template #action>
      <AppButton :icon="Plus" @click="router.push({ name: 'nodo-nuevo' })">Registrar nodo</AppButton>
    </template>
  </PageTitle>

  <div class="mb-6 grid gap-4 sm:grid-cols-3">
    <StatCard label="Nodos registrados" :value="total" detail="Inventario total" :icon="Cpu" />
    <StatCard label="Nodos en línea" :value="enLinea" :detail="porcentajeEnLinea" :icon="CircleCheck" tone="green" />
    <StatCard
      label="Requieren atención"
      :value="requierenAtencion"
      detail="Sin conexión o degradados"
      :icon="TriangleAlert"
      tone="red"
    />
  </div>

  <AppCard class="mb-4">
    <div class="grid gap-3 md:grid-cols-[2fr_1fr]">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          v-model="filtros.busqueda"
          type="search"
          placeholder="Buscar por serie o nombre"
          aria-label="Buscar nodo"
          :class="[inputClass, 'pl-9']"
        />
      </div>
      <select v-model="filtros.estado" aria-label="Filtrar por estado" :class="inputClass">
        <option value="">Todos los estados</option>
        <option v-for="(ui, estado) in NODO_ESTADO_UI" :key="estado" :value="estado">{{ ui.label }}</option>
      </select>
    </div>
  </AppCard>

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <AppCard flush>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[860px] text-left">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th class="px-5 py-3">Serie</th>
              <th class="px-5 py-3">Nodo</th>
              <th class="px-5 py-3">Ubicación</th>
              <th class="px-5 py-3">Última comunicación</th>
              <th v-if="muestraRegistrador" class="px-5 py-3">Registrado por</th>
              <th class="px-5 py-3">Estado</th>
              <th class="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="nodo in filtrados" :key="nodo.id" class="hover:bg-blue-50/30">
              <td class="px-5 py-4 text-sm font-bold text-ink">{{ nodo.codigo }}</td>
              <td class="px-5 py-4">
                <span class="block text-sm font-semibold">{{ nodo.nombre }}</span>
                <span class="block text-xs text-muted">
                  {{ nodo.sensores.length }} sensor{{ nodo.sensores.length === 1 ? "" : "es" }} ·
                  {{ nodo.actuadores.length }} actuador{{ nodo.actuadores.length === 1 ? "" : "es" }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-muted">
                <span class="block">{{ nodo.inmuebleNombre || "Sin asignar" }}</span>
                <span v-if="nodo.zonaNombre" class="block text-xs">{{ nodo.zonaNombre }}</span>
              </td>
              <td class="px-5 py-4 text-sm text-muted">{{ nodo.ultimaComunicacion }}</td>
              <td v-if="muestraRegistrador" class="px-5 py-4 text-sm text-muted">{{ nodo.registradoPor ?? "—" }}</td>
              <td class="px-5 py-4">
                <AppBadge :tone="NODO_ESTADO_UI[nodo.estado].tone" :icon="NODO_ESTADO_UI[nodo.estado].icon">
                  {{ NODO_ESTADO_UI[nodo.estado].label }}
                </AppBadge>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <RouterLink
                    :to="{ name: 'nodo-detalle', params: { id: nodo.id } }"
                    :aria-label="`Ver detalle de ${nodo.codigo}`"
                    title="Ver detalle"
                    class="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <Eye class="size-4" aria-hidden="true" />
                  </RouterLink>
                  <RouterLink
                    :to="{ name: 'nodo-editar', params: { id: nodo.id } }"
                    :aria-label="`Editar ${nodo.codigo}`"
                    title="Editar"
                    class="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <Pencil class="size-4" aria-hidden="true" />
                  </RouterLink>
                  <button
                    type="button"
                    :aria-label="`Eliminar ${nodo.codigo}`"
                    title="Eliminar"
                    class="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-red-50 hover:text-danger"
                    @click="nodoAEliminar = nodo"
                  >
                    <Trash2 class="size-4" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtrados.length">
              <td :colspan="muestraRegistrador ? 7 : 6" class="px-5 py-12 text-center text-sm text-muted">
                {{ total ? "Ningún nodo coincide con los filtros." : "Aún no hay nodos registrados." }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>
  </LoadingState>

  <ConfirmModal
    v-if="nodoAEliminar"
    title="¿Eliminar nodo?"
    confirm-label="Eliminar"
    :loading="eliminando"
    @confirm="confirmarEliminacion"
    @cancel="nodoAEliminar = null"
  >
    <p>
      Se eliminará <strong>{{ nodoAEliminar.codigo }} · {{ nodoAEliminar.nombre }}</strong> del inventario. Esta
      acción no se puede deshacer.
    </p>
  </ConfirmModal>
</template>
