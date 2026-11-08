<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import FormField from "@/app/shared/components/ui/FormField.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";

defineProps<{ guardando: boolean; error: string | null }>();
const emit = defineEmits<{ guardar: [string]; cancelar: [] }>();

const clave = ref("");
const errorClave = ref("");

function guardar() {
  const c = clave.value;
  const valida = c.length >= 12 && /[a-z]/.test(c) && /[A-Z]/.test(c) && /\d/.test(c) && /[^A-Za-z0-9]/.test(c);
  errorClave.value = valida ? "" : "Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo";
  if (valida) emit("guardar", c);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("cancelar");
}
onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5" @mousedown.self="emit('cancelar')">
    <form
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-titulo"
      class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      novalidate
      @submit.prevent="guardar"
    >
      <h2 id="reset-titulo" class="text-xl font-bold text-ink">Restablecer contraseña</h2>
      <p class="mt-2 text-sm leading-6 text-muted">
        Define una contraseña temporal. El usuario deberá cambiarla al iniciar sesión y se cerrarán sus sesiones activas.
      </p>

      <div class="mt-5">
        <FormField label="Nueva contraseña" :error="errorClave">
          <input v-model="clave" type="password" autocomplete="new-password" :class="inputClass" />
        </FormField>
      </div>

      <p v-if="error" class="mt-4 text-sm font-medium text-danger" role="alert">{{ error }}</p>

      <div class="mt-7 flex justify-end gap-3">
        <AppButton variant="secondary" @click="emit('cancelar')">Cancelar</AppButton>
        <AppButton type="submit" :loading="guardando">Restablecer</AppButton>
      </div>
    </form>
  </div>
</template>
