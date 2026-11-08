<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ChevronRight, CircleCheck, Cpu, MapPin, Pencil, Plus, Trash2, TriangleAlert } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import StatCard from "@/app/shared/components/ui/StatCard.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { useToast } from "@/app/shared/composables/useToast";
import { deleteInmueble, getInmueble } from "../../../data/ubicaciones.service";
import { ESTADO_UBICACION_UI } from "../../config/ubicacion-ui";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const inmuebleId = route.params.inmuebleId as string;

const { data: inmueble, loading, error, reload } = useAsyncData(() => getInmueble(inmuebleId));

const eliminando = ref(false);
const confirmando = ref(false);

async function eliminar() {
  eliminando.value = true;
  try {
    await deleteInmueble(inmuebleId);
    toast.add({ type: "success", message: "Inmueble eliminado" });
    router.push({ name: "ubicaciones" });
  } catch (e) {
    confirmando.value = false;
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo eliminar el inmueble" });
  } finally {
    eliminando.value = false;
  }
}
</script>

<template>
  <BackButton :to="{ name: 'ubicaciones' }" />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="inmueble">
      <PageTitle :title="inmueble.nombre" :description="`${inmueble.direccion} · Edificio supervisado`">
        <template #action>
          <AppButton variant="secondary" :icon="Plus" @click="router.push({ name: 'zona-nueva', params: { inmuebleId } })">
            Agregar zona
          </AppButton>
          <AppButton variant="secondary" :icon="Pencil" @click="router.push({ name: 'inmueble-editar', params: { inmuebleId } })">
            Editar
          </AppButton>
          <AppButton variant="ghost" :icon="Trash2" @click="confirmando = true">Eliminar</AppButton>
        </template>
      </PageTitle>

      <div class="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Estado"
          :value="ESTADO_UBICACION_UI[inmueble.estado].label"
          :detail="inmueble.estado === 'operativo' ? 'Sin incidencias' : 'Hay nodos que requieren atención'"
          :icon="inmueble.estado === 'operativo' ? CircleCheck : TriangleAlert"
          :tone="inmueble.estado === 'operativo' ? 'green' : 'amber'"
        />
        <StatCard label="Zonas" :value="inmueble.zonas.length" detail="Zonas supervisadas" :icon="MapPin" />
        <StatCard label="Nodos" :value="inmueble.nodos" :detail="`${inmueble.nodosEnLinea} en línea`" :icon="Cpu" />
      </div>

      <AppCard>
        <h2 class="text-lg font-bold text-ink">Zonas del edificio</h2>
        <p v-if="!inmueble.zonas.length" class="mt-4 text-sm text-muted">Este inmueble aún no tiene zonas.</p>
        <div class="mt-4 divide-y divide-slate-100">
          <RouterLink
            v-for="zona in inmueble.zonas"
            :key="zona.id"
            :to="{ name: 'zona-detalle', params: { inmuebleId: inmueble.id, zonaId: zona.id } }"
            class="flex w-full items-center gap-4 py-4 hover:bg-blue-50/40"
          >
            <span class="grid size-10 place-items-center rounded-lg bg-blue-50 text-brand-dark">
              <MapPin class="size-5" aria-hidden="true" />
            </span>
            <span class="flex-1">
              <span class="block text-sm font-semibold">{{ zona.nombre }}</span>
              <span class="block text-xs text-muted">{{ zona.nodos }} nodos</span>
            </span>
            <AppBadge :tone="ESTADO_UBICACION_UI[zona.estado].tone" :icon="ESTADO_UBICACION_UI[zona.estado].icon">
              {{ ESTADO_UBICACION_UI[zona.estado].label }}
            </AppBadge>
            <ChevronRight class="size-4 text-slate-400" aria-hidden="true" />
          </RouterLink>
        </div>
      </AppCard>
    </template>
  </LoadingState>

  <ConfirmModal
    v-if="confirmando"
    title="¿Eliminar inmueble?"
    confirm-label="Eliminar"
    :loading="eliminando"
    @confirm="eliminar"
    @cancel="confirmando = false"
  >
    <p>Solo se puede eliminar un inmueble sin zonas ni usuarios asignados. Esta acción no se puede deshacer.</p>
  </ConfirmModal>
</template>
