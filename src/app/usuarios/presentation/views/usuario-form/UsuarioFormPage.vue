<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { KeyRound } from "@lucide/vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import FormField from "@/app/shared/components/ui/FormField.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import { useToast } from "@/app/shared/composables/useToast";
import {
  createUsuario,
  getAsignaciones,
  getUsuario,
  resetPassword,
  saveAsignaciones,
  updateUsuario,
} from "../../../data/usuarios.service";
import AsignacionesEditor from "../../components/AsignacionesEditor.vue";
import RestablecerContrasenaModal from "../../components/RestablecerContrasenaModal.vue";
import {
  ROL_DESCRIPCION,
  ROL_LABEL,
  type Asignacion,
  type EstadoUsuario,
  type RolUsuario,
} from "../../models/usuario";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const usuarioId = route.params.id as string | undefined;
const editando = !!usuarioId;

const form = reactive({
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  rol: "Operator" as RolUsuario,
  estado: "activo" as EstadoUsuario,
});
const asignaciones = ref<Asignacion[]>([]);
const errores = reactive<Record<string, string>>({});

const cargando = ref(editando);
const errorCarga = ref<string | null>(null);
const guardando = ref(false);
const errorGuardado = ref<string | null>(null);
const confirmacion = ref(false);
// Si el usuario se creó pero fallaron las asignaciones, un nuevo intento no vuelve a crearlo
const creadoId = ref<string | null>(null);

const descripcionRol = computed(() => ROL_DESCRIPCION[form.rol]);
const requiereAsignaciones = computed(() => form.rol !== "Administrator");
const zonaObligatoria = computed(() => form.rol === "Resident");

async function cargar() {
  if (!editando) return;
  cargando.value = true;
  errorCarga.value = null;
  try {
    const [usuario, existentes] = await Promise.all([getUsuario(usuarioId!), getAsignaciones(usuarioId!)]);
    Object.assign(form, {
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      estado: usuario.estado,
      rol: usuario.rol ?? form.rol,
    });
    asignaciones.value = existentes;
  } catch (e) {
    errorCarga.value = e instanceof Error ? e.message : "No se pudo cargar el usuario";
  } finally {
    cargando.value = false;
  }
}
cargar();

function validar(): boolean {
  Object.keys(errores).forEach((k) => delete errores[k]);
  if (!form.nombres.trim()) errores.nombres = "Ingresa los nombres";
  if (!form.apellidos.trim()) errores.apellidos = "Ingresa los apellidos";
  if (!editando && !creadoId.value) {
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errores.email = "Ingresa un correo válido";
    const clave = form.password;
    const valida =
      clave.length >= 12 && /[a-z]/.test(clave) && /[A-Z]/.test(clave) && /\d/.test(clave) && /[^A-Za-z0-9]/.test(clave);
    if (!valida) errores.password = "Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo";
  }
  if (requiereAsignaciones.value) {
    if (asignaciones.value.some((a) => !a.inmuebleId)) errores.asignaciones = "Selecciona un inmueble en cada asignación";
    else if (zonaObligatoria.value && (!asignaciones.value.length || asignaciones.value.some((a) => !a.zonaId))) {
      errores.asignaciones = "Un residente debe tener al menos una zona asignada";
    }
  }
  return Object.keys(errores).length === 0;
}

async function guardar() {
  errorGuardado.value = null;
  if (!validar()) return;
  guardando.value = true;
  try {
    let id = usuarioId ?? creadoId.value;
    if (editando) {
      await updateUsuario(id!, {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        estado: form.estado,
      });
    } else if (!id) {
      id = (
        await createUsuario({
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          email: form.email.trim(),
          password: form.password,
          rol: form.rol,
        })
      ).id;
      creadoId.value = id;
    }
    if (requiereAsignaciones.value && id) {
      try {
        await saveAsignaciones(id, asignaciones.value);
      } catch (e) {
        throw new Error(
          `${editando ? "" : "El usuario se creó, pero "}no se pudieron guardar las asignaciones: ${e instanceof Error ? e.message : "error desconocido"}`,
        );
      }
    }
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

// Restablecer contraseña
const restableciendo = ref(false);
const guardandoClave = ref(false);
const errorClave = ref<string | null>(null);

async function restablecer(nueva: string) {
  guardandoClave.value = true;
  errorClave.value = null;
  try {
    await resetPassword(usuarioId!, nueva);
    restableciendo.value = false;
    toast.add({ type: "success", message: "Contraseña restablecida. El usuario deberá cambiarla al iniciar sesión." });
  } catch (e) {
    errorClave.value = e instanceof Error ? e.message : "No se pudo restablecer la contraseña";
  } finally {
    guardandoClave.value = false;
  }
}
</script>

<template>
  <BackButton :to="{ name: 'usuarios' }" />
  <PageTitle
    :title="editando ? 'Editar usuario' : 'Agregar usuario'"
    :description="editando ? 'Actualiza la información del usuario.' : 'Completa la información del nuevo usuario.'"
  >
    <template v-if="editando" #action>
      <AppButton variant="secondary" :icon="KeyRound" @click="restableciendo = true">Restablecer contraseña</AppButton>
    </template>
  </PageTitle>

  <LoadingState :loading="cargando" :error="errorCarga" @retry="cargar">
    <form class="max-w-2xl" novalidate @submit.prevent="guardar">
      <AppCard>
        <div class="grid gap-5 sm:grid-cols-2">
          <FormField label="Nombres" :error="errores.nombres">
            <input v-model="form.nombres" :class="inputClass" placeholder="Nombres" />
          </FormField>
          <FormField label="Apellidos" :error="errores.apellidos">
            <input v-model="form.apellidos" :class="inputClass" placeholder="Apellidos" />
          </FormField>
          <FormField label="Correo electrónico" :error="errores.email" class="sm:col-span-2">
            <input
              v-model="form.email"
              type="email"
              :disabled="editando || !!creadoId"
              :class="inputClass"
              placeholder="correo@safecore.com"
            />
          </FormField>
          <FormField
            v-if="!editando && !creadoId"
            label="Contraseña inicial"
            :error="errores.password"
            hint="Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo."
            class="sm:col-span-2"
          >
            <input v-model="form.password" type="password" autocomplete="new-password" :class="inputClass" />
          </FormField>
          <FormField label="Rol" :hint="descripcionRol">
            <select v-model="form.rol" :disabled="editando || !!creadoId" :class="inputClass">
              <option v-for="(label, rol) in ROL_LABEL" :key="rol" :value="rol">{{ label }}</option>
            </select>
          </FormField>
          <FormField v-if="editando" label="Estado">
            <select v-model="form.estado" :class="inputClass">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </FormField>
        </div>

        <div v-if="requiereAsignaciones" class="mt-8">
          <h2 class="text-lg font-bold">Inmuebles asignados</h2>
          <p class="mb-4 mt-1 text-sm text-muted">
            {{
              zonaObligatoria
                ? "El residente solo ve los nodos de su zona."
                : "Define a qué inmuebles o zonas tiene acceso este usuario."
            }}
          </p>
          <AsignacionesEditor v-model="asignaciones" :zona-obligatoria="zonaObligatoria" :error="errores.asignaciones" />
        </div>

        <p v-if="errorGuardado" class="mt-5 text-sm font-medium text-danger" role="alert">{{ errorGuardado }}</p>

        <div class="mt-8 flex justify-end gap-3">
          <AppButton variant="secondary" @click="router.push({ name: 'usuarios' })">Cancelar</AppButton>
          <AppButton type="submit" :loading="guardando">{{ editando ? "Guardar cambios" : "Guardar usuario" }}</AppButton>
        </div>
      </AppCard>
    </form>
  </LoadingState>

  <RestablecerContrasenaModal
    v-if="restableciendo"
    :guardando="guardandoClave"
    :error="errorClave"
    @guardar="restablecer"
    @cancelar="restableciendo = false"
  />

  <ConfirmModal
    v-if="confirmacion"
    :title="editando ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'"
    tone="success"
    confirm-label="Continuar"
    hide-cancel
    @confirm="continuar"
    @cancel="continuar"
  >
    <p>{{ editando ? "Los cambios del usuario fueron guardados." : "El usuario ya puede iniciar sesión en la app móvil." }}</p>
  </ConfirmModal>
</template>
