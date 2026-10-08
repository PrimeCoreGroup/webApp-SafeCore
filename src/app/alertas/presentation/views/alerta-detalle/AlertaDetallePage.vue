<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { TriangleAlert } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { useToast } from "@/app/shared/composables/useToast";
import { getAlerta, resolverAlerta } from "../../../data/alertas.service";
import { ESTADO_ALERTA_LABEL, SEVERIDAD_UI } from "../../config/alerta-ui";
import type { Alerta } from "../../models/alerta";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const id = route.params.id as string;

const { data: alerta, loading, error, reload } = useAsyncData(() => getAlerta(id));

const confirmando = ref(false);
const resolviendo = ref(false);

async function resolver() {
  resolviendo.value = true;
  try {
    await resolverAlerta(id);
    router.replace({ name: "alerta-resuelta", params: { id } });
  } catch (e) {
    confirmando.value = false;
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo resolver la alerta" });
  } finally {
    resolviendo.value = false;
  }
}

function filas(a: Alerta): [string, string][] {
  return [
    ["Tipo de evento", a.evento],
    ["Severidad", SEVERIDAD_UI[a.severidad].label],
    ["Ubicación", a.ubicacion],
    ["Fecha / hora", a.fecha],
    ["Dispositivo", a.dispositivo],
    ["Estado", ESTADO_ALERTA_LABEL[a.estado]],
  ];
}
</script>

<template>
  <BackButton :to="{ name: 'alertas' }" />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <template v-if="alerta">
      <PageTitle :title="alerta.evento" description="Información detallada de la alerta.">
        <template #action>
          <AppBadge :tone="SEVERIDAD_UI[alerta.severidad].tone" :icon="SEVERIDAD_UI[alerta.severidad].icon">
            {{ SEVERIDAD_UI[alerta.severidad].label }} · {{ ESTADO_ALERTA_LABEL[alerta.estado] }}
          </AppBadge>
        </template>
      </PageTitle>

      <div class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <AppCard>
          <h2 class="text-lg font-bold">Descripción</h2>
          <p class="mt-3 text-sm leading-6 text-muted">{{ alerta.descripcion }}</p>
          <dl class="mt-6 divide-y divide-slate-100">
            <div v-for="[term, value] in filas(alerta)" :key="term" class="grid grid-cols-2 gap-4 py-4 text-sm">
              <dt class="text-muted">{{ term }}</dt>
              <dd class="text-right font-semibold">{{ value }}</dd>
            </div>
          </dl>
          <RouterLink
            v-if="alerta.dispositivoId"
            :to="{ name: 'sensor-detalle', params: { id: alerta.dispositivoId } }"
            class="mt-2 inline-block text-sm font-semibold text-brand-dark hover:underline"
          >
            Ver dispositivo
          </RouterLink>
        </AppCard>

        <AppCard v-if="alerta.estado === 'activa'" class="self-start">
          <span class="grid size-12 place-items-center rounded-xl bg-red-50 text-danger">
            <TriangleAlert class="size-7" aria-hidden="true" />
          </span>
          <h2 class="mt-5 text-xl font-bold">Atender alerta</h2>
          <p class="mt-2 text-sm leading-6 text-muted">
            Confirma la atención después de verificar el evento y aplicar el protocolo.
          </p>
          <div class="mt-6">
            <AppButton variant="danger" @click="confirmando = true">Resolver alerta</AppButton>
          </div>
        </AppCard>
      </div>
    </template>
  </LoadingState>

  <ConfirmModal
    v-if="confirmando"
    title="¿Resolver alerta?"
    confirm-label="Resolver"
    :loading="resolviendo"
    @confirm="resolver"
    @cancel="confirmando = false"
  >
    <p>Esta acción marcará la alerta como resuelta. Confirma que el evento fue verificado y atendido.</p>
  </ConfirmModal>
</template>
