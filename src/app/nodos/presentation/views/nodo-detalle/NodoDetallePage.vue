<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { FlaskConical, KeyRound, Pencil, Plus, Trash2, TriangleAlert } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { useToast } from "@/app/shared/composables/useToast";
import {
  createComponente,
  deleteComponente,
  getNodo,
  probarComponente,
  rotarSecreto,
  updateComponente,
} from "../../../data/nodos.service";
import ComponenteModal from "../../components/ComponenteModal.vue";
import SecretoNodoModal from "../../components/SecretoNodoModal.vue";
import { ACTUADOR_UI, COMPONENTE_ESTADO_UI, NODO_ESTADO_UI, SENSOR_UI } from "../../config/nodo-ui";
import { componentesConFalla } from "../../models/nodo";
import type { ClaseComponente, ComponenteInput, ComponenteNodo, Nodo } from "../../models/nodo";

const route = useRoute();
const toast = useToast();
const id = route.params.id as string;

const { data: nodo, loading, error, reload } = useAsyncData(() => getNodo(id));

// Secreto
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

// Componentes
const modal = ref<{ clase: ClaseComponente; componente: ComponenteNodo | null } | null>(null);
const guardando = ref(false);
const errorModal = ref<string | null>(null);
const componenteAEliminar = ref<ComponenteNodo | null>(null);
const eliminando = ref(false);
const probando = ref<string | null>(null);

function abrirModal(clase: ClaseComponente, componente: ComponenteNodo | null = null) {
  errorModal.value = null;
  modal.value = { clase, componente };
}

async function guardarComponente(input: ComponenteInput) {
  if (!modal.value) return;
  guardando.value = true;
  errorModal.value = null;
  try {
    if (modal.value.componente) await updateComponente(id, modal.value.componente.id, input);
    else await createComponente(id, input);
    modal.value = null;
    await reload();
  } catch (e) {
    errorModal.value = e instanceof Error ? e.message : "No se pudo guardar el componente";
  } finally {
    guardando.value = false;
  }
}

async function eliminarComponente() {
  if (!componenteAEliminar.value) return;
  eliminando.value = true;
  try {
    await deleteComponente(id, componenteAEliminar.value.id);
    toast.add({ type: "success", message: `${componenteAEliminar.value.nombre} eliminado` });
    componenteAEliminar.value = null;
    await reload();
  } catch (e) {
    componenteAEliminar.value = null;
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo eliminar el componente" });
  } finally {
    eliminando.value = false;
  }
}

async function probar(componente: ComponenteNodo) {
  probando.value = componente.id;
  try {
    const resultado = await probarComponente(id, componente.id);
    if (resultado.estado === "completed") {
      toast.add({ type: "success", message: `Prueba de ${componente.nombre} completada` });
    } else if (resultado.estado === "failed") {
      toast.add({ type: "error", message: `La prueba de ${componente.nombre} falló${resultado.detalle ? `: ${resultado.detalle}` : ""}` });
    } else {
      toast.add({ type: "info", message: "El nodo aún no reportó el resultado de la prueba" });
    }
    await reload();
  } catch (e) {
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo ejecutar la prueba" });
  } finally {
    probando.value = null;
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

function iconoDe(c: ComponenteNodo) {
  return c.clase === "sensor" ? SENSOR_UI[c.tipo as keyof typeof SENSOR_UI].icono : ACTUADOR_UI[c.tipo as keyof typeof ACTUADOR_UI].icono;
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

      <p
        v-if="componentesConFalla(nodo)"
        class="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-[#C71F1F]"
        role="alert"
      >
        <TriangleAlert class="size-5 shrink-0" aria-hidden="true" />
        {{ componentesConFalla(nodo) }} componente{{ componentesConFalla(nodo) === 1 ? "" : "s" }} con falla. Revisa el nodo y reemplaza lo que haga falta.
      </p>

      <div class="grid gap-6 lg:grid-cols-[1fr_1.7fr]">
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
          <AppCard
            v-for="grupo in [
              { clase: 'sensor' as ClaseComponente, titulo: 'Sensores', vacio: 'Este nodo aún no tiene sensores.', lista: nodo.sensores },
              { clase: 'actuador' as ClaseComponente, titulo: 'Actuadores', vacio: 'Este nodo aún no tiene actuadores.', lista: nodo.actuadores },
            ]"
            :key="grupo.clase"
          >
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-bold">{{ grupo.titulo }}</h2>
              <AppButton variant="secondary" :icon="Plus" @click="abrirModal(grupo.clase)">Agregar</AppButton>
            </div>
            <p v-if="!grupo.lista.length" class="mt-4 text-sm text-muted">{{ grupo.vacio }}</p>
            <ul class="mt-2 divide-y divide-slate-100">
              <li v-for="componente in grupo.lista" :key="componente.id" class="flex flex-wrap items-center gap-4 py-4">
                <span class="grid size-10 place-items-center rounded-lg bg-blue-50 text-brand-dark">
                  <component :is="iconoDe(componente)" class="size-5" aria-hidden="true" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-semibold">{{ componente.nombre }}</span>
                  <span class="block text-xs text-muted">
                    <template v-if="componente.clase === 'sensor'">
                      {{ componente.ultimaLectura ?? "Sin lectura" }}
                    </template>
                    <template v-else>{{ componente.canal ? `Canal ${componente.canal}` : "Actuador" }}</template>
                    · {{ componente.ultimaSenal ?? "Sin señal" }}
                  </span>
                </span>
                <AppBadge
                  :tone="COMPONENTE_ESTADO_UI[componente.estado].tone"
                  :icon="COMPONENTE_ESTADO_UI[componente.estado].icon"
                >
                  {{ COMPONENTE_ESTADO_UI[componente.estado].label }}
                </AppBadge>
                <div class="flex items-center gap-1">
                  <AppButton
                    v-if="componente.clase === 'actuador'"
                    variant="ghost"
                    :icon="FlaskConical"
                    :loading="probando === componente.id"
                    :disabled="nodo.estado !== 'online' || probando !== null"
                    :title="nodo.estado !== 'online' ? 'El nodo debe estar en línea para probar' : 'Probar actuador'"
                    @click="probar(componente)"
                  >
                    Probar
                  </AppButton>
                  <button
                    type="button"
                    :aria-label="`Editar ${componente.nombre}`"
                    title="Editar"
                    class="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
                    @click="abrirModal(componente.clase, componente)"
                  >
                    <Pencil class="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    :aria-label="`Eliminar ${componente.nombre}`"
                    title="Eliminar"
                    class="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-red-50 hover:text-danger"
                    @click="componenteAEliminar = componente"
                  >
                    <Trash2 class="size-4" aria-hidden="true" />
                  </button>
                </div>
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

  <ComponenteModal
    v-if="modal"
    :clase="modal.clase"
    :componente="modal.componente"
    :guardando="guardando"
    :error="errorModal"
    @guardar="guardarComponente"
    @cancelar="modal = null"
  />

  <ConfirmModal
    v-if="componenteAEliminar"
    title="¿Eliminar componente?"
    confirm-label="Eliminar"
    :loading="eliminando"
    @confirm="eliminarComponente"
    @cancel="componenteAEliminar = null"
  >
    <p>
      Se eliminará <strong>{{ componenteAEliminar.nombre }}</strong> del nodo. Si ya tiene historial, márcalo como
      deshabilitado en lugar de eliminarlo.
    </p>
  </ConfirmModal>
</template>
