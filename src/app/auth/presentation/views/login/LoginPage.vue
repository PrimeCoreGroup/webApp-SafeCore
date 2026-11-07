<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ShieldCheck } from "@lucide/vue";
import { clearToken, clearUser, setToken } from "@/lib/api";
import { useAuth } from "@/app/shared/composables/useAuth";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import ConfirmModal from "@/app/shared/components/ui/ConfirmModal.vue";
import FormField from "@/app/shared/components/ui/FormField.vue";
import { loginRequest } from "../../../data/auth.service";

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(
  route.query.expired ? "Tu sesión venció. Inicia sesión nuevamente." : null,
);
const olvidoContrasena = ref(false);

async function onSubmit() {
  error.value = null;
  if (!email.value.trim() || !password.value) {
    error.value = "Ingresa tu correo y contraseña.";
    return;
  }

  loading.value = true;
  try {
    const { token, user } = await loginRequest({ email: email.value.trim(), password: password.value });

    // La web es solo para administradores
    if (!user.roles.includes("Administrator")) {
      clearToken();
      clearUser();
      error.value = "Esta plataforma es solo para administradores. Usa la app móvil de SafeCore.";
      return;
    }

    setToken(token);
    login(user);
    await router.replace("/dashboard");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "No se pudo iniciar sesión.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
    <section class="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="absolute -right-32 top-20 size-96 rounded-full border border-blue-400/20" />
      <div class="absolute -right-12 top-40 size-64 rounded-full border border-blue-400/20" />
      <div class="relative flex items-center gap-3 text-xl font-bold">
        <span class="grid size-10 place-items-center rounded-xl bg-brand">
          <ShieldCheck class="size-5" aria-hidden="true" />
        </span>
        SafeCore
      </div>
      <div class="relative max-w-xl">
        <p class="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Protección conectada</p>
        <h1 class="text-4xl font-bold leading-tight xl:text-5xl">Seguridad y respuesta, siempre bajo control.</h1>
        <p class="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
          Supervisa espacios, dispositivos y alertas desde una plataforma clara y confiable.
        </p>
      </div>
      <p class="relative text-sm text-slate-400">Sistema IoT de protección ante emergencias</p>
    </section>

    <section class="flex min-h-screen items-center justify-center bg-surface p-6">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div class="mb-9 flex items-center gap-3 text-xl font-bold text-ink lg:hidden">
          <span class="grid size-10 place-items-center rounded-xl bg-brand text-white">
            <ShieldCheck class="size-5" aria-hidden="true" />
          </span>
          SafeCore
        </div>
        <p class="text-sm font-semibold text-brand-dark">Bienvenido de nuevo</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-ink">Iniciar sesión</h2>
        <p class="mt-2 text-sm text-muted">Ingresa tus datos para acceder al sistema.</p>

        <form class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
          <FormField label="Correo electrónico">
            <input
              v-model="email"
              type="email"
              autocomplete="username"
              placeholder="correo@safecore.com"
              :class="[inputClass, 'h-12']"
            />
          </FormField>
          <FormField label="Contraseña">
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              :class="[inputClass, 'h-12']"
            />
          </FormField>
          <div class="text-right">
            <button
              type="button"
              class="text-sm font-semibold text-brand-dark hover:underline"
              @click="olvidoContrasena = true"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <p v-if="error" class="text-sm font-medium text-danger" role="alert">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="h-12 w-full rounded-lg bg-brand text-sm font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
          >
            {{ loading ? "Ingresando…" : "Iniciar sesión" }}
          </button>
        </form>
      </div>
    </section>
  </main>

  <ConfirmModal
    v-if="olvidoContrasena"
    title="Restablecer contraseña"
    tone="info"
    confirm-label="Entendido"
    hide-cancel
    @confirm="olvidoContrasena = false"
    @cancel="olvidoContrasena = false"
  >
    <p>
      La contraseña la restablece un administrador. Comunícate con él para que te asigne una nueva.
    </p>
  </ConfirmModal>
</template>
