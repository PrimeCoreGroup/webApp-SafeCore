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
import { createInmueble, getInmueble, updateInmueble } from "../../../data/ubicaciones.service";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const inmuebleId = route.params.inmuebleId as string | undefined;
const editando = !!inmuebleId;

const form = reactive({ nombre: "", direccion: "" });
const errores = reactive<Record<string, string>>({});
const cargando = ref(editando);
const errorCarga = ref<string | null>(null);
const guardando = ref(false);
const errorGuardado = ref<string | null>(null);

async function cargar() {
  if (!editando) return;
  cargando.value = true;
  errorCarga.value = null;
  try {
    const inmueble = await getInmueble(inmuebleId!);
    Object.assign(form, { nombre: inmueble.nombre, direccion: inmueble.direccion });
  } catch (e) {
    errorCarga.value = e instanceof Error ? e.message : "No se pudo cargar el inmueble";
  } finally {
    cargando.value = false;
  }
}
cargar();

async function guardar() {
  errorGuardado.value = null;
  Object.keys(errores).forEach((k) => delete errores[k]);
  if (!form.nombre.trim()) errores.nombre = "Ingresa un nombre";
  if (!form.direccion.trim()) errores.direccion = "Ingresa la dirección";
  if (Object.keys(errores).length) return;

  guardando.value = true;
  const datos = { nombre: form.nombre.trim(), direccion: form.direccion.trim() };
  try {
    if (editando) await updateInmueble(inmuebleId!, datos);
    else await createInmueble(datos);
    toast.add({ type: "success", message: editando ? "Inmueble actualizado" : "Inmueble creado" });
    router.push({ name: "ubicaciones" });
  } catch (e) {
    errorGuardado.value = e instanceof Error ? e.message : "No se pudo guardar el inmueble";
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <BackButton :to="{ name: 'ubicaciones' }" />
  <PageTitle
    :title="editando ? 'Editar inmueble' : 'Agregar inmueble'"
    :description="editando ? 'Actualiza la información del inmueble.' : 'Registra un edificio o una vivienda.'"
  />

  <LoadingState :loading="cargando" :error="errorCarga" @retry="cargar">
    <form class="max-w-2xl" novalidate @submit.prevent="guardar">
      <AppCard>
        <div class="grid gap-5">
          <FormField label="Nombre" :error="errores.nombre">
            <input v-model="form.nombre" maxlength="100" :class="inputClass" placeholder="Sede Principal" />
          </FormField>
          <FormField label="Dirección" :error="errores.direccion">
            <input v-model="form.direccion" maxlength="200" :class="inputClass" placeholder="Av. Central 245" />
          </FormField>
        </div>

        <p v-if="errorGuardado" class="mt-5 text-sm font-medium text-danger" role="alert">{{ errorGuardado }}</p>

        <div class="mt-8 flex justify-end gap-3">
          <AppButton variant="secondary" @click="router.push({ name: 'ubicaciones' })">Cancelar</AppButton>
          <AppButton type="submit" :loading="guardando">{{ editando ? "Guardar cambios" : "Agregar inmueble" }}</AppButton>
        </div>
      </AppCard>
    </form>
  </LoadingState>
</template>
