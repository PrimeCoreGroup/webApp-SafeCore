<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { KeyRound, Pencil } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { useToast } from "@/app/shared/composables/useToast";
import { getNodo, rotarSecreto } from "../../../data/nodos.service";
import SecretoNodoModal from "../../components/SecretoNodoModal.vue";
import { ACTUADOR_UI, NODO_ESTADO_UI, SENSOR_UI } from "../../config/nodo-ui";
import type { Nodo } from "../../models/nodo";

const route = useRoute();
const toast = useToast();
const id = route.params.id as string;

const { data: nodo, loading, error, reload } = useAsyncData(() => getNodo(id));

const confirmandoRotacion = ref(false);
const rotando = ref(false);
const secreto = ref<string | null>(null);

async function rotar() {
  rotando.value = true;
  try {
    secreto.value = (await rotarSecreto(id)).secreto;
  } catch (e) {
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo rotar el secreto" });
  } finally {
    confirmandoRotacion.value = false;
    rotando.value = false;
  }
}

function filas(n: Nodo): [string, string][] {
  const filas: [string, string][] = [
    ["Número de serie", n.codigo],
    ["Estado", NODO_ESTADO_UI[n.estado].label],
    ["Ubicación", n.inmuebleNombre ? `${n.inmuebleNombre} · ${n.zonaNombre}` : "Sin asignar"],
    ["Última comunicación", n.ultimaComunicacion],
    ["Registrado el", n.creadoEn],
  ];
  if (n.registradoPor) filas.push(["Registrado por", n.registradoPor]);
  return filas;
}
</script>

<template>
  <BackButton :to="{ name: 'nodos' }" />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="nodo">
      <PageTitle :title="nodo.nombre" :description="`Serie ${nodo.codigo}`">
        <template #action>
          <AppButton variant="secondary" :icon="KeyRound" @click="confirmandoRotacion = true">Rotar secreto</AppButton>
          <RouterLink :to="{ name: 'nodo-editar', params: { id: nodo.id } }">
            <AppButton :icon="Pencil" tabindex="-1">Editar</AppButton>
          </RouterLink>
        </template>
      </PageTitle>

      <div class="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <AppCard class="self-start">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold">Información principal</h2>
            <AppBadge :tone="NODO_ESTADO_UI[nodo.estado].tone" :icon="NODO_ESTADO_UI[nodo.estado].icon">
              {{ NODO_ESTADO_UI[nodo.estado].label }}
            </AppBadge>
          </div>
          <dl class="mt-5 divide-y divide-slate-100">
            <div v-for="[term, value] in filas(nodo)" :key="term" class="grid grid-cols-2 gap-4 py-4 text-sm">
              <dt class="text-muted">{{ term }}</dt>
              <dd class="text-right font-semibold">{{ value }}</dd>
            </div>
          </dl>
        </AppCard>

        <div class="space-y-6">
          <AppCard>
            <h2 class="text-lg font-bold">Sensores</h2>
            <p v-if="!nodo.sensores.length" class="mt-4 text-sm text-muted">Este nodo aún no reporta sensores.</p>
            <ul class="mt-2 divide-y divide-slate-100">
              <li v-for="sensor in nodo.sensores" :key="sensor.id" class="flex items-center gap-4 py-4">
                <span class="grid size-10 place-items-center rounded-lg bg-blue-50 text-brand-dark">
                  <component :is="SENSOR_UI[sensor.tipo].icono" class="size-5" aria-hidden="true" />
                </span>
                <span class="flex-1">
                  <span class="block text-sm font-semibold">{{ sensor.nombre }}</span>
                  <span class="block text-xs text-muted">Última lectura</span>
                </span>
                <span :class="['text-sm font-semibold', sensor.ultimaLectura ? '' : 'text-muted']">
                  {{ sensor.ultimaLectura ?? "Sin lectura" }}
                </span>
              </li>
            </ul>
          </AppCard>

          <AppCard>
            <h2 class="text-lg font-bold">Actuadores</h2>
            <p v-if="!nodo.actuadores.length" class="mt-4 text-sm text-muted">Este nodo no tiene actuadores.</p>
            <ul class="mt-2 divide-y divide-slate-100">
              <li v-for="actuador in nodo.actuadores" :key="actuador.id" class="flex items-center gap-4 py-4">
                <span class="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
                  <component :is="ACTUADOR_UI[actuador.tipo].icono" class="size-5" aria-hidden="true" />
                </span>
                <span class="text-sm font-semibold">{{ actuador.nombre }}</span>
              </li>
            </ul>
          </AppCard>
        </div>
      </div>
    </template>
  </LoadingState>

  <ConfirmModal
    v-if="confirmandoRotacion"
    title="¿Rotar el secreto del nodo?"
    confirm-label="Rotar secreto"
    :loading="rotando"
    @confirm="rotar"
    @cancel="confirmandoRotacion = false"
  >
    <p>El secreto actual dejará de funcionar y tendrás que configurar el nuevo en el nodo.</p>
  </ConfirmModal>

  <SecretoNodoModal v-if="secreto" titulo="Nuevo secreto del nodo" :secreto="secreto" @cerrar="secreto = null" />
</template>
