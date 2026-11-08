<script setup lang="ts">
import { reactive, ref } from "vue";
import { KeyRound } from "@lucide/vue";
import { clearToken, clearUser } from "@/lib/api";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import FormField from "@/app/shared/components/ui/FormField.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import { changePasswordRequest } from "../../../data/auth.service";

const form = reactive({ actual: "", nueva: "", confirmacion: "" });
const errores = reactive<Record<string, string>>({});
const guardando = ref(false);
const errorGuardado = ref<string | null>(null);

function validar(): boolean {
  Object.keys(errores).forEach((k) => delete errores[k]);
  const clave = form.nueva;
  if (!form.actual) errores.actual = "Ingresa tu contraseña actual";
  const valida =
    clave.length >= 12 && /[a-z]/.test(clave) && /[A-Z]/.test(clave) && /\d/.test(clave) && /[^A-Za-z0-9]/.test(clave);
  if (!valida) errores.nueva = "Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo";
  else if (clave === form.actual) errores.nueva = "La nueva contraseña debe ser distinta de la actual";
  if (form.confirmacion !== clave) errores.confirmacion = "Las contraseñas no coinciden";
  return Object.keys(errores).length === 0;
}

async function guardar() {
  errorGuardado.value = null;
  if (!validar()) return;
  guardando.value = true;
  try {
    await changePasswordRequest(form.actual, form.nueva);
    // El backend invalida la sesión al cambiar la contraseña
    clearToken();
    clearUser();
    window.location.href = "/login?changed=1";
  } catch (e) {
    errorGuardado.value = e instanceof Error ? e.message : "No se pudo cambiar la contraseña";
    guardando.value = false;
  }
}

function cerrarSesion() {
  clearToken();
  clearUser();
  window.location.href = "/login";
}
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-surface p-6">
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <span class="grid size-12 place-items-center rounded-xl bg-blue-50 text-brand-dark">
        <KeyRound class="size-6" aria-hidden="true" />
      </span>
      <h1 class="mt-5 text-2xl font-bold tracking-tight text-ink">Cambia tu contraseña</h1>
      <p class="mt-2 text-sm text-muted">
        Un administrador restableció tu contraseña. Define una nueva para continuar.
      </p>

      <form class="mt-8 space-y-5" novalidate @submit.prevent="guardar">
        <FormField label="Contraseña actual" :error="errores.actual">
          <input v-model="form.actual" type="password" autocomplete="current-password" :class="inputClass" />
        </FormField>
        <FormField
          label="Nueva contraseña"
          :error="errores.nueva"
          hint="Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo."
        >
          <input v-model="form.nueva" type="password" autocomplete="new-password" :class="inputClass" />
        </FormField>
        <FormField label="Confirmar nueva contraseña" :error="errores.confirmacion">
          <input v-model="form.confirmacion" type="password" autocomplete="new-password" :class="inputClass" />
        </FormField>

        <p v-if="errorGuardado" class="text-sm font-medium text-danger" role="alert">{{ errorGuardado }}</p>

        <AppButton type="submit" :loading="guardando" class="w-full">Cambiar contraseña</AppButton>
      </form>

      <button type="button" class="mt-5 w-full text-center text-sm font-semibold text-brand-dark hover:underline" @click="cerrarSesion">
        Cerrar sesión
      </button>
    </div>
  </main>
</template>
