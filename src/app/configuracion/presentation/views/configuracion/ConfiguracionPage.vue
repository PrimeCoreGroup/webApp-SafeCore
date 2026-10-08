<script setup lang="ts">
import { reactive, ref } from "vue";
import { Bell, Check, Settings, TriangleAlert } from "@lucide/vue";
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
import { ZONAS_HORARIAS, type Configuracion } from "../../models/configuracion";

const toast = useToast();

const config = reactive<Configuracion>({
  nombreSistema: "",
  zonaHoraria: "",
  protocolos: { alertasCriticas: false, notificarResponsables: false, confirmacionManual: false },
  preferencias: { notificacionesSistema: false, resumenActividad: false, alertasInformativas: false },
});

const cargando = ref(true);
const errorCarga = ref<string | null>(null);
const guardando = ref(false);
const guardado = ref(false);

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

async function guardar() {
  guardando.value = true;
  try {
    await saveConfiguracion(JSON.parse(JSON.stringify(config)) as Configuracion);
    guardado.value = true;
  } catch (e) {
    toast.add({ type: "error", message: e instanceof Error ? e.message : "No se pudo guardar la configuración" });
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <PageTitle title="Configuración" description="Preferencias generales y protocolos de SafeCore." mock />

  <LoadingState :loading="cargando" :error="errorCarga" @retry="cargar">
    <div class="grid gap-6 lg:grid-cols-3">
      <AppCard>
        <span class="grid size-10 place-items-center rounded-lg bg-blue-50 text-brand-dark">
          <Settings class="size-5" aria-hidden="true" />
        </span>
        <h2 class="mt-4 text-lg font-bold">Configuración general</h2>
        <div class="mt-5 space-y-4">
          <FormField label="Nombre del sistema">
            <input v-model="config.nombreSistema" :class="inputClass" />
          </FormField>
          <FormField label="Zona horaria">
            <select v-model="config.zonaHoraria" :class="inputClass">
              <option v-for="zona in ZONAS_HORARIAS" :key="zona.value" :value="zona.value">{{ zona.label }}</option>
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
          <ToggleSwitch v-model="config.protocolos.alertasCriticas" label="Activar alertas críticas" />
          <ToggleSwitch v-model="config.protocolos.notificarResponsables" label="Notificar a responsables" />
          <ToggleSwitch v-model="config.protocolos.confirmacionManual" label="Confirmación manual" />
        </div>
      </AppCard>

      <AppCard>
        <span class="grid size-10 place-items-center rounded-lg bg-amber-50 text-amber-700">
          <Bell class="size-5" aria-hidden="true" />
        </span>
        <h2 class="mt-4 text-lg font-bold">Preferencias</h2>
        <div class="mt-4 divide-y divide-slate-100">
          <ToggleSwitch v-model="config.preferencias.notificacionesSistema" label="Notificaciones del sistema" />
          <ToggleSwitch v-model="config.preferencias.resumenActividad" label="Resumen de actividad" />
          <ToggleSwitch v-model="config.preferencias.alertasInformativas" label="Alertas informativas" />
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
