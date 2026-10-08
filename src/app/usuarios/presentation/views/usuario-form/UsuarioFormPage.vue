<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import FormField from "@/app/shared/components/ui/FormField.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import { createUsuario, getUsuario, updateUsuario } from "../../../data/usuarios.service";
import { ROL_LABEL, type UsuarioInput } from "../../models/usuario";

const route = useRoute();
const router = useRouter();

const usuarioId = route.params.id as string | undefined;
const editando = !!usuarioId;

const form = reactive<UsuarioInput>({ nombre: "", email: "", rol: "PROPIETARIO", estado: "activo" });
const errores = reactive<Record<string, string>>({});

const cargando = ref(editando);
const errorCarga = ref<string | null>(null);
const guardando = ref(false);
const errorGuardado = ref<string | null>(null);
const confirmacion = ref(false);

async function cargar() {
  if (!editando) return;
  cargando.value = true;
  errorCarga.value = null;
  try {
    const { nombre, email, rol, estado } = await getUsuario(usuarioId!);
    Object.assign(form, { nombre, email, rol, estado });
  } catch (e) {
    errorCarga.value = e instanceof Error ? e.message : "No se pudo cargar el usuario";
  } finally {
    cargando.value = false;
  }
}
cargar();

function validar(): boolean {
  Object.keys(errores).forEach((k) => delete errores[k]);
  if (!form.nombre.trim()) errores.nombre = "Ingresa el nombre completo";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errores.email = "Ingresa un correo válido";
  return Object.keys(errores).length === 0;
}

async function guardar() {
  errorGuardado.value = null;
  if (!validar()) return;
  guardando.value = true;
  const payload: UsuarioInput = { ...form, nombre: form.nombre.trim(), email: form.email.trim() };
  try {
    if (editando) await updateUsuario(usuarioId!, payload);
    else await createUsuario(payload);
    confirmacion.value = true;
  } catch (e) {
    errorGuardado.value = e instanceof Error ? e.message : "No se pudo guardar el usuario";
  } finally {
    guardando.value = false;
  }
}

function continuar() {
  router.push({ name: "usuarios" });
}
</script>

<template>
  <BackButton :to="{ name: 'usuarios' }" />
  <PageTitle
    :title="editando ? 'Editar usuario' : 'Agregar usuario'"
    :description="editando ? 'Actualiza la información del usuario.' : 'Completa la información del nuevo usuario.'"
  />

  <LoadingState :loading="cargando" :error="errorCarga" @retry="cargar">
    <form class="max-w-2xl" novalidate @submit.prevent="guardar">
      <AppCard>
        <div class="grid gap-5 sm:grid-cols-2">
          <FormField label="Nombre completo" :error="errores.nombre" class="sm:col-span-2">
            <input v-model="form.nombre" :class="inputClass" placeholder="Nombre del usuario" />
          </FormField>
          <FormField label="Correo electrónico" :error="errores.email" class="sm:col-span-2">
            <input v-model="form.email" type="email" :class="inputClass" placeholder="correo@safecore.com" />
          </FormField>
          <FormField label="Rol">
            <select v-model="form.rol" :class="inputClass">
              <option v-for="(label, rol) in ROL_LABEL" :key="rol" :value="rol">{{ label }}</option>
            </select>
          </FormField>
          <FormField label="Estado">
            <select v-model="form.estado" :class="inputClass">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </FormField>
        </div>

        <p v-if="errorGuardado" class="mt-5 text-sm font-medium text-danger" role="alert">{{ errorGuardado }}</p>

        <div class="mt-8 flex justify-end gap-3">
          <AppButton variant="secondary" @click="router.push({ name: 'usuarios' })">Cancelar</AppButton>
          <AppButton type="submit" :loading="guardando">{{ editando ? "Guardar cambios" : "Guardar usuario" }}</AppButton>
        </div>
      </AppCard>
    </form>
  </LoadingState>

  <ConfirmModal
    v-if="confirmacion"
    :title="editando ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'"
    tone="success"
    confirm-label="Continuar"
    hide-cancel
    @confirm="continuar"
    @cancel="continuar"
  >
    <p>{{ editando ? "Los cambios del usuario fueron guardados." : "El usuario fue creado correctamente." }}</p>
  </ConfirmModal>
</template>
