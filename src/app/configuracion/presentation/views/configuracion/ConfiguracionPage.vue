<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Check, Gauge, Settings, TriangleAlert } from "@lucide/vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import FormField from "@/app/shared/components/ui/FormField.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import ToggleSwitch from "@/app/shared/components/ui/ToggleSwitch.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import { useToast } from "@/app/shared/composables/useToast";
import { getConfiguracion, saveConfiguracion } from "../../../data/configuracion.service";
import { CAMPOS_UMBRAL, ZONAS_HORARIAS, type Configuracion } from "../../models/configuracion";

const toast = useToast();

const config = reactive<Configuracion>({
  nombreSistema: "",
  zonaHoraria: "",
  alertasCriticas: false,
  notificarResponsables: false,
  confirmacionManual: false,
  umbrales: { temperaturaCelsius: 0, gasAdcSubida: 0, aceleracionDelta: 0, impactoMs: 0 },
});
const errores = reactive<Record<string, string>>({});

const cargando = ref(true);
const errorCarga = ref<string | null>(null);
const guardando = ref(false);
const guardado = ref(false);

// Si la zona horaria del backend no está en la lista, se agrega para no perderla
const zonas = computed(() =>
  ZONAS_HORARIAS.some((z) => z.value === config.zonaHoraria) || !config.zonaHoraria
    ? ZONAS_HORARIAS
    : [...ZONAS_HORARIAS, { value: config.zonaHoraria, label: config.zonaHoraria }],
);

async function cargar() {
  cargando.value = true;
  errorCarga.value = null;
  try {
    Object.assign(config, await getConfiguracion());
  } catch (e) {
    errorCarga.value = e instanceof Error ? e.message : "No se pudo cargar la configuración";
  } finally {
    cargando.value = false;
  }
}
cargar();

function validar(): boolean {
  Object.keys(errores).forEach((k) => delete errores[k]);
  if (!config.nombreSistema.trim()) errores.nombreSistema = "Ingresa el nombre del sistema";
  for (const campo of CAMPOS_UMBRAL) {
    const valor = config.umbrales[campo.clave];
    const fueraDeRango =
      typeof valor !== "number" ||
      Number.isNaN(valor) ||
      (campo.minExclusivo ? valor <= campo.min : valor < campo.min) ||
      valor > campo.max ||
      (campo.entero && !Number.isInteger(valor));
    if (fueraDeRango) errores[campo.clave] = `Valor fuera de rango: ${campo.rango.toLowerCase()}`;
  }
  return Object.keys(errores).length === 0;
}

async function guardar() {
  if (!validar()) return;
  guardando.value = true;
  try {
    Object.assign(config, await saveConfiguracion(JSON.parse(JSON.stringify(config)) as Configuracion));
    guardado.value = true;
  } catch (e) {
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo guardar la configuración" });
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <PageTitle title="Configuración" description="Preferencias generales, protocolos y umbrales de seguridad." />

  <LoadingState :loading="cargando" :error="errorCarga" @retry="cargar">
    <div class="grid gap-6 lg:grid-cols-2">
      <AppCard>
        <span class="grid size-10 place-items-center rounded-lg bg-blue-50 text-brand-dark">
          <Settings class="size-5" aria-hidden="true" />
        </span>
        <h2 class="mt-4 text-lg font-bold">Configuración general</h2>
        <div class="mt-5 space-y-4">
          <FormField label="Nombre del sistema" :error="errores.nombreSistema">
            <input v-model="config.nombreSistema" maxlength="100" :class="inputClass" />
          </FormField>
          <FormField label="Zona horaria" hint="Se usa para agrupar las alertas por día en Analítica.">
            <select v-model="config.zonaHoraria" :class="inputClass">
              <option v-for="zona in zonas" :key="zona.value" :value="zona.value">{{ zona.label }}</option>
            </select>
          </FormField>
        </div>
      </AppCard>

      <AppCard>
        <span class="grid size-10 place-items-center rounded-lg bg-red-50 text-danger">
          <TriangleAlert class="size-5" aria-hidden="true" />
        </span>
        <h2 class="mt-4 text-lg font-bold">Protocolos de emergencia</h2>
        <div class="mt-4 divide-y divide-slate-100">
          <ToggleSwitch v-model="config.alertasCriticas" label="Activar alertas críticas" />
          <ToggleSwitch v-model="config.notificarResponsables" label="Notificar a responsables de seguridad" />
          <ToggleSwitch v-model="config.confirmacionManual" label="Confirmación manual de respuestas" />
        </div>
      </AppCard>

      <AppCard class="lg:col-span-2">
        <span class="grid size-10 place-items-center rounded-lg bg-amber-50 text-amber-700">
          <Gauge class="size-5" aria-hidden="true" />
        </span>
        <h2 class="mt-4 text-lg font-bold">Umbrales de seguridad</h2>
        <p class="mt-1 text-sm text-muted">Definen cuándo el sistema genera una alerta a partir de las lecturas de los nodos.</p>
        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            v-for="campo in CAMPOS_UMBRAL"
            :key="campo.clave"
            :label="campo.etiqueta"
            :error="errores[campo.clave]"
            :hint="`${campo.descripcion} ${campo.rango}.`"
          >
            <input v-model.number="config.umbrales[campo.clave]" type="number" step="any" :class="inputClass" />
          </FormField>
        </div>
      </AppCard>
    </div>

    <div class="mt-6 flex justify-end">
      <AppButton :icon="Check" :loading="guardando" @click="guardar">Guardar cambios</AppButton>
    </div>
  </LoadingState>

  <ConfirmModal
    v-if="guardado"
    title="Configuración guardada"
    tone="success"
    hide-cancel
    @confirm="guardado = false"
    @cancel="guardado = false"
  >
    <p>Los cambios de configuración se guardaron correctamente.</p>
  </ConfirmModal>
</template>
