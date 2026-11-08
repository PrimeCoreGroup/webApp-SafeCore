<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import FormField from "@/app/shared/components/ui/FormField.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import { useToast } from "@/app/shared/composables/useToast";
import { createZona, getZona, updateZona } from "../../../data/ubicaciones.service";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const inmuebleId = route.params.inmuebleId as string;
const zonaId = route.params.zonaId as string | undefined;
const editando = !!zonaId;

const form = reactive({ nombre: "" });
const errorNombre = ref("");
const cargando = ref(editando);
const errorCarga = ref<string | null>(null);
const guardando = ref(false);
const errorGuardado = ref<string | null>(null);

async function cargar() {
  if (!editando) return;
  cargando.value = true;
  errorCarga.value = null;
  try {
    form.nombre = (await getZona(inmuebleId, zonaId!)).zona.nombre;
  } catch (e) {
    errorCarga.value = e instanceof Error ? e.message : "No se pudo cargar la zona";
  } finally {
    cargando.value = false;
  }
}
cargar();

async function guardar() {
  errorGuardado.value = null;
  errorNombre.value = form.nombre.trim() ? "" : "Ingresa un nombre";
  if (errorNombre.value) return;

  guardando.value = true;
  const datos = { nombre: form.nombre.trim() };
  try {
    if (editando) await updateZona(zonaId!, datos);
    else await createZona(inmuebleId, datos);
    toast.add({ type: "success", message: editando ? "Zona actualizada" : "Zona creada" });
    router.push({ name: "inmueble-detalle", params: { inmuebleId } });
  } catch (e) {
    errorGuardado.value = e instanceof Error ? e.message : "No se pudo guardar la zona";
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <BackButton :to="{ name: 'inmueble-detalle', params: { inmuebleId } }" />
  <PageTitle
    :title="editando ? 'Editar zona' : 'Agregar zona'"
    :description="editando ? 'Actualiza el nombre de la zona.' : 'Registra un piso, área o ambiente del inmueble.'"
  />

  <LoadingState :loading="cargando" :error="errorCarga" @retry="cargar">
    <form class="max-w-2xl" novalidate @submit.prevent="guardar">
      <AppCard>
        <FormField label="Nombre" :error="errorNombre">
          <input v-model="form.nombre" maxlength="100" :class="inputClass" placeholder="Piso 3 · Oficinas" />
        </FormField>

        <p v-if="errorGuardado" class="mt-5 text-sm font-medium text-danger" role="alert">{{ errorGuardado }}</p>

        <div class="mt-8 flex justify-end gap-3">
          <AppButton variant="secondary" @click="router.push({ name: 'inmueble-detalle', params: { inmuebleId } })">
            Cancelar
          </AppButton>
          <AppButton type="submit" :loading="guardando">{{ editando ? "Guardar cambios" : "Agregar zona" }}</AppButton>
        </div>
      </AppCard>
    </form>
  </LoadingState>
</template>
