<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import FormField from "@/app/shared/components/ui/FormField.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getInmuebles } from "@/app/ubicaciones/data/ubicaciones.service";
import { createNodo, getNodo, updateNodo } from "../../../data/nodos.service";
import ComponentesEditor from "../../components/ComponentesEditor.vue";
import SecretoNodoModal from "../../components/SecretoNodoModal.vue";
import { KIT_ESTANDAR, NODO_ESTADO_UI } from "../../config/nodo-ui";
import type { EstadoNodo, KitNodo } from "../../models/nodo";

const route = useRoute();
const router = useRouter();

const nodoId = route.params.id as string | undefined;
const editando = !!nodoId;

const { data: inmuebles, loading: cargandoInmuebles, error: errorInmuebles, reload: recargarInmuebles } = useAsyncData(getInmuebles);

const form = reactive({ codigo: "", nombre: "", estado: "offline" as EstadoNodo, inmuebleId: "", zonaId: "" });
const kit = ref<KitNodo>({ sensores: [...KIT_ESTANDAR.sensores], actuadores: [...KIT_ESTANDAR.actuadores] });
const errores = reactive<Record<string, string>>({});

const cargando = ref(editando);
const errorCarga = ref<string | null>(null);
const guardando = ref(false);
const errorGuardado = ref<string | null>(null);
const confirmacion = ref(false);
const registrado = ref<{ id: string; secreto: string; aviso: string | null } | null>(null);

const zonas = computed(() => inmuebles.value?.find((i) => i.id === form.inmuebleId)?.zonas ?? []);

async function cargar() {
  if (!editando) return;
  cargando.value = true;
  errorCarga.value = null;
  try {
    const nodo = await getNodo(nodoId!);
    Object.assign(form, {
      codigo: nodo.codigo,
      nombre: nodo.nombre,
      estado: nodo.estado,
      inmuebleId: nodo.inmuebleId,
      zonaId: nodo.zonaId,
    });
  } catch (e) {
    errorCarga.value = e instanceof Error ? e.message : "No se pudo cargar el nodo";
  } finally {
    cargando.value = false;
  }
}
cargar();

function validar(): boolean {
  Object.keys(errores).forEach((k) => delete errores[k]);
  if (!form.codigo.trim()) errores.codigo = "Ingresa el número de serie";
  if (!form.nombre.trim()) errores.nombre = "Ingresa un nombre";
  if (form.inmuebleId && !form.zonaId) errores.zonaId = "Selecciona una zona";
  return Object.keys(errores).length === 0;
}

async function guardar() {
  errorGuardado.value = null;
  if (!validar()) return;
  guardando.value = true;
  const datos = {
    codigo: form.codigo.trim(),
    nombre: form.nombre.trim(),
    estado: form.estado,
    zonaId: form.zonaId || null,
    kit: kit.value,
  };
  try {
    if (editando) {
      await updateNodo(nodoId!, datos);
      confirmacion.value = true;
    } else {
      const { nodo, secreto, aviso } = await createNodo(datos);
      registrado.value = { id: nodo.id, secreto, aviso };
    }
  } catch (e) {
    errorGuardado.value = e instanceof Error ? e.message : "No se pudo guardar el nodo";
  } finally {
    guardando.value = false;
  }
}

function irAlDetalle() {
  router.push(registrado.value ? { name: "nodo-detalle", params: { id: registrado.value.id } } : { name: "nodos" });
}
</script>

<template>
  <BackButton :to="editando ? { name: 'nodo-detalle', params: { id: nodoId } } : { name: 'nodos' }" />
  <PageTitle
    :title="editando ? 'Editar nodo' : 'Registrar nodo'"
    :description="editando ? 'Actualiza la información del nodo.' : 'Registra un nodo y define sus sensores y actuadores.'"
  />

  <LoadingState
    :loading="cargando || cargandoInmuebles"
    :error="errorCarga || errorInmuebles"
    @retry="() => { cargar(); recargarInmuebles(); }"
  >
    <form class="max-w-3xl" novalidate @submit.prevent="guardar">
      <AppCard>
        <div class="grid gap-5 sm:grid-cols-2">
          <FormField label="Número de serie" :error="errores.codigo" hint="Identifica al controlador del nodo.">
            <input v-model="form.codigo" :class="inputClass" placeholder="NODO-001" />
          </FormField>
          <FormField label="Nombre" :error="errores.nombre">
            <input v-model="form.nombre" :class="inputClass" placeholder="Nodo Recepción" />
          </FormField>
          <FormField label="Inmueble" hint="Opcional. Puedes asignarlo después.">
            <select v-model="form.inmuebleId" :class="inputClass" @change="form.zonaId = ''">
              <option value="">Sin asignar</option>
              <option v-for="inmueble in inmuebles ?? []" :key="inmueble.id" :value="inmueble.id">{{ inmueble.nombre }}</option>
            </select>
          </FormField>
          <FormField label="Zona" :error="errores.zonaId">
            <select v-model="form.zonaId" :disabled="!form.inmuebleId" :class="inputClass">
              <option value="">Selecciona una zona</option>
              <option v-for="zona in zonas" :key="zona.id" :value="zona.id">{{ zona.nombre }}</option>
            </select>
          </FormField>
          <FormField
            v-if="editando"
            label="Estado"
            hint="Se actualiza solo cuando el nodo envía datos; aquí puedes ajustarlo a mano."
            class="sm:col-span-2"
          >
            <select v-model="form.estado" :class="inputClass">
              <option v-for="(ui, estado) in NODO_ESTADO_UI" :key="estado" :value="estado">{{ ui.label }}</option>
            </select>
          </FormField>
        </div>

        <div v-if="!editando" class="mt-8">
          <h2 class="text-lg font-bold">Componentes del nodo</h2>
          <p class="mb-4 mt-1 text-sm text-muted">
            Ajusta los sensores y actuadores según el tamaño del inmueble. Podrás editarlos después desde el detalle.
          </p>
          <ComponentesEditor v-model="kit" />
        </div>

        <p v-if="errorGuardado" class="mt-5 text-sm font-medium text-danger" role="alert">{{ errorGuardado }}</p>

        <div class="mt-8 flex justify-end gap-3">
          <AppButton variant="secondary" @click="router.push({ name: 'nodos' })">Cancelar</AppButton>
          <AppButton type="submit" :loading="guardando">{{ editando ? "Guardar cambios" : "Registrar nodo" }}</AppButton>
        </div>
      </AppCard>
    </form>
  </LoadingState>

  <SecretoNodoModal
    v-if="registrado"
    titulo="Nodo registrado"
    :secreto="registrado.secreto"
    :aviso="registrado.aviso"
    @cerrar="irAlDetalle"
  />

  <ConfirmModal
    v-if="confirmacion"
    title="Nodo actualizado correctamente"
    tone="success"
    confirm-label="Continuar"
    hide-cancel
    @confirm="router.push({ name: 'nodo-detalle', params: { id: nodoId } })"
    @cancel="router.push({ name: 'nodo-detalle', params: { id: nodoId } })"
  >
    <p>Los cambios del nodo fueron guardados.</p>
  </ConfirmModal>
</template>
