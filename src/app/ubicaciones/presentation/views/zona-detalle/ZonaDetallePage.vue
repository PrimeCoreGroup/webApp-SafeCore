<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ChevronRight, Cpu, Pencil, Trash2 } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { useToast } from "@/app/shared/composables/useToast";
import { NODO_ESTADO_UI } from "@/app/nodos/presentation/config/nodo-ui";
import { deleteZona, getZona } from "../../../data/ubicaciones.service";
import { ESTADO_UBICACION_UI } from "../../config/ubicacion-ui";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const inmuebleId = route.params.inmuebleId as string;
const zonaId = route.params.zonaId as string;

const { data, loading, error, reload } = useAsyncData(() => getZona(inmuebleId, zonaId));

const eliminando = ref(false);
const confirmando = ref(false);

async function eliminar() {
  eliminando.value = true;
  try {
    await deleteZona(zonaId);
    toast.add({ type: "success", message: "Zona eliminada" });
    router.push({ name: "inmueble-detalle", params: { inmuebleId } });
  } catch (e) {
    confirmando.value = false;
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo eliminar la zona" });
  } finally {
    eliminando.value = false;
  }
}
</script>

<template>
  <BackButton :to="{ name: 'inmueble-detalle', params: { inmuebleId } }" />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="data">
      <PageTitle :title="data.zona.nombre" :description="`${data.inmueble.nombre} · Zona supervisada`">
        <template #action>
          <AppButton
            variant="secondary"
            :icon="Pencil"
            @click="router.push({ name: 'zona-editar', params: { inmuebleId, zonaId } })"
          >
            Editar
          </AppButton>
          <AppButton variant="ghost" :icon="Trash2" @click="confirmando = true">Eliminar</AppButton>
        </template>
      </PageTitle>

      <AppCard>
        <div class="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-lg font-bold">Nodos de la zona</h2>
            <p class="mt-1 text-sm text-muted">{{ data.nodos.length }} nodos instalados</p>
          </div>
          <AppBadge
            :tone="ESTADO_UBICACION_UI[data.zona.estado].tone"
            :icon="ESTADO_UBICACION_UI[data.zona.estado].icon"
          >
            {{ data.zona.estado === "operativo" ? "Zona operativa" : "Zona con atención" }}
          </AppBadge>
        </div>

        <p v-if="!data.nodos.length" class="py-8 text-center text-sm text-muted">
          Esta zona aún no tiene nodos. Asígnalos desde el formulario de cada nodo.
        </p>

        <div class="mt-2 divide-y divide-slate-100">
          <RouterLink
            v-for="nodo in data.nodos"
            :key="nodo.id"
            :to="{ name: 'nodo-detalle', params: { id: nodo.id } }"
            class="flex w-full items-center gap-4 py-4 hover:bg-blue-50/40"
          >
            <span class="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
              <Cpu class="size-5" aria-hidden="true" />
            </span>
            <span class="flex-1">
              <span class="block text-sm font-semibold">{{ nodo.nombre }}</span>
              <span class="block text-xs text-muted">
                {{ nodo.sensores.length }} sensores · {{ nodo.actuadores.length }} actuadores
              </span>
            </span>
            <AppBadge :tone="NODO_ESTADO_UI[nodo.estado].tone" :icon="NODO_ESTADO_UI[nodo.estado].icon">
              {{ NODO_ESTADO_UI[nodo.estado].label }}
            </AppBadge>
            <ChevronRight class="size-4 text-slate-400" aria-hidden="true" />
          </RouterLink>
        </div>
      </AppCard>
    </template>
  </LoadingState>

  <ConfirmModal
    v-if="confirmando"
    title="¿Eliminar zona?"
    confirm-label="Eliminar"
    :loading="eliminando"
    @confirm="eliminar"
    @cancel="confirmando = false"
  >
    <p>Solo se puede eliminar una zona sin nodos ni usuarios asignados. Esta acción no se puede deshacer.</p>
  </ConfirmModal>
</template>
