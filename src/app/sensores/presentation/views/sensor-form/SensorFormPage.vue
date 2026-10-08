<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
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
import { getInmuebles, getNodos } from "@/app/ubicaciones/data/ubicaciones.service";
import { createSensor, getSensor, updateSensor } from "../../../data/sensores.service";
import { SENSOR_ESTADO_UI, SENSOR_TIPOS, SENSOR_TIPO_OPCIONES } from "../../config/sensor-ui";
import type { SensorInput } from "../../models/sensor";

const route = useRoute();
const router = useRouter();

const sensorId = route.params.id as string | undefined;
const editando = !!sensorId;

const { data: inmuebles, loading: cargandoInmuebles, error: errorInmuebles, reload } = useAsyncData(getInmuebles);
const { data: nodos } = useAsyncData(getNodos);

const form = reactive<SensorInput>({
  id: "",
  nombre: "",
  tipo: "temperatura",
  inmuebleId: "",
  zonaId: "",
  nodoId: "",
  umbralMin: null,
  umbralMax: null,
  estado: "activo",
});

const cargandoSensor = ref(editando);
const errores = reactive<Record<string, string>>({});
const guardando = ref(false);
const errorGuardado = ref<string | null>(null);
const confirmacion = ref(false);

if (editando) {
  getSensor(sensorId!)
    .then((sensor) => {
      Object.assign(form, {
        id: sensor.id,
        nombre: sensor.nombre,
        tipo: sensor.tipo,
        inmuebleId: sensor.inmuebleId,
        zonaId: sensor.zonaId,
        nodoId: sensor.nodoId,
        umbralMin: sensor.umbralMin,
        umbralMax: sensor.umbralMax,
        estado: sensor.estado,
      });
    })
    .catch((e) => (errorGuardado.value = e instanceof Error ? e.message : "No se pudo cargar el sensor"))
    .finally(() => (cargandoSensor.value = false));
}

const zonasDisponibles = computed(() => inmuebles.value?.find((i) => i.id === form.inmuebleId)?.zonas ?? []);
const nodosDisponibles = computed(() => (nodos.value ?? []).filter((n) => n.inmuebleId === form.inmuebleId));
const unidad = computed(() => SENSOR_TIPOS[form.tipo].unidad);

// Al cambiar de inmueble se reinician zona y nodo; si solo hay un nodo se preselecciona.
watch(
  () => form.inmuebleId,
  () => {
    if (!zonasDisponibles.value.some((z) => z.id === form.zonaId)) form.zonaId = "";
    if (!nodosDisponibles.value.some((n) => n.id === form.nodoId)) {
      form.nodoId = nodosDisponibles.value.length === 1 ? nodosDisponibles.value[0]!.id : "";
    }
  },
);

watch(
  () => form.tipo,
  () => {
    if (!unidad.value) {
      form.umbralMin = null;
      form.umbralMax = null;
    }
  },
);

function validar(): boolean {
  Object.keys(errores).forEach((k) => delete errores[k]);
  if (!form.id.trim()) errores.id = "Ingresa el identificador del dispositivo";
  if (!form.nombre.trim()) errores.nombre = "Ingresa un nombre";
  if (!form.inmuebleId) errores.inmuebleId = "Selecciona un inmueble";
  if (!form.zonaId) errores.zonaId = "Selecciona una zona";
  if (!form.nodoId) errores.nodoId = "Selecciona un nodo";
  if (unidad.value && form.umbralMin !== null && form.umbralMax !== null && form.umbralMin >= form.umbralMax) {
    errores.umbralMax = "El umbral máximo debe ser mayor que el mínimo";
  }
  return Object.keys(errores).length === 0;
}

async function guardar() {
  errorGuardado.value = null;
  if (!validar()) return;
  guardando.value = true;
  const payload: SensorInput = { ...form, id: form.id.trim(), nombre: form.nombre.trim() };
  try {
    if (editando) await updateSensor(sensorId!, payload);
    else await createSensor(payload);
    confirmacion.value = true;
  } catch (e) {
    errorGuardado.value = e instanceof Error ? e.message : "No se pudo guardar el sensor";
  } finally {
    guardando.value = false;
  }
}

function continuar() {
  router.push({ name: "sensores" });
}
</script>

<template>
  <BackButton :to="{ name: 'sensores' }" />
  <PageTitle
    :title="editando ? 'Editar sensor' : 'Registrar sensor'"
    :description="editando ? 'Actualiza la información del sensor.' : 'Completa la información del nuevo sensor.'"
  />

  <LoadingState :loading="cargandoInmuebles || cargandoSensor" :error="errorInmuebles" @retry="reload">
    <form class="max-w-3xl" novalidate @submit.prevent="guardar">
      <AppCard>
        <div class="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Identificador del dispositivo"
            :error="errores.id"
            hint="Código del dispositivo (p. ej. TEMP-001)."
          >
            <input v-model="form.id" :disabled="editando" :class="inputClass" placeholder="TEMP-001" />
          </FormField>
          <FormField label="Nombre" :error="errores.nombre">
            <input v-model="form.nombre" :class="inputClass" placeholder="Sensor de temperatura" />
          </FormField>

          <FormField label="Tipo de sensor">
            <select v-model="form.tipo" :class="inputClass">
              <option v-for="tipo in SENSOR_TIPO_OPCIONES" :key="tipo.value" :value="tipo.value">
                {{ tipo.label }}
              </option>
            </select>
          </FormField>
          <FormField v-if="editando" label="Estado">
            <select v-model="form.estado" :class="inputClass">
              <option v-for="(ui, estado) in SENSOR_ESTADO_UI" :key="estado" :value="estado">{{ ui.label }}</option>
            </select>
          </FormField>

          <FormField label="Inmueble" :error="errores.inmuebleId">
            <select v-model="form.inmuebleId" :class="inputClass">
              <option value="" disabled>Selecciona un inmueble</option>
              <option v-for="inmueble in inmuebles ?? []" :key="inmueble.id" :value="inmueble.id">
                {{ inmueble.nombre }}
              </option>
            </select>
          </FormField>
          <FormField label="Zona" :error="errores.zonaId">
            <select v-model="form.zonaId" :disabled="!form.inmuebleId" :class="inputClass">
              <option value="" disabled>Selecciona una zona</option>
              <option v-for="zona in zonasDisponibles" :key="zona.id" :value="zona.id">{{ zona.nombre }}</option>
            </select>
          </FormField>

          <FormField
            label="Nodo Edge"
            :error="errores.nodoId"
            hint="Nodo al que se conecta el dispositivo."
            class="sm:col-span-2"
          >
            <select v-model="form.nodoId" :disabled="!form.inmuebleId" :class="inputClass">
              <option value="" disabled>Selecciona un nodo</option>
              <option v-for="nodo in nodosDisponibles" :key="nodo.id" :value="nodo.id">{{ nodo.nombre }}</option>
            </select>
          </FormField>

          <template v-if="unidad">
            <FormField :label="`Umbral mínimo (${unidad})`">
              <input v-model.number="form.umbralMin" type="number" step="any" :class="inputClass" placeholder="Sin mínimo" />
            </FormField>
            <FormField :label="`Umbral máximo (${unidad})`" :error="errores.umbralMax">
              <input v-model.number="form.umbralMax" type="number" step="any" :class="inputClass" placeholder="Sin máximo" />
            </FormField>
          </template>
        </div>

        <p v-if="errorGuardado" class="mt-5 text-sm font-medium text-danger" role="alert">{{ errorGuardado }}</p>

        <div class="mt-8 flex justify-end gap-3">
          <AppButton variant="secondary" @click="router.push({ name: 'sensores' })">Cancelar</AppButton>
          <AppButton type="submit" :loading="guardando">
            {{ editando ? "Guardar cambios" : "Registrar sensor" }}
          </AppButton>
        </div>
      </AppCard>
    </form>
  </LoadingState>

  <ConfirmModal
    v-if="confirmacion"
    :title="editando ? 'Sensor actualizado correctamente' : 'Sensor registrado correctamente'"
    tone="success"
    confirm-label="Continuar"
    hide-cancel
    @confirm="continuar"
    @cancel="continuar"
  >
    <p>{{ editando ? "Los cambios del sensor fueron guardados." : "El sensor fue agregado al inventario." }}</p>
  </ConfirmModal>
</template>
