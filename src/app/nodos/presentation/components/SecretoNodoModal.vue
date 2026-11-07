<script setup lang="ts">
import { ref } from "vue";
import { Check, Copy, KeyRound } from "@lucide/vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";

defineProps<{ secreto: string; titulo: string }>();
const emit = defineEmits<{ cerrar: [] }>();

const copiado = ref(false);

async function copiar(secreto: string) {
  try {
    await navigator.clipboard.writeText(secreto);
    copiado.value = true;
  } catch {
    copiado.value = false;
  }
}
</script>

<template>
  <!-- No se cierra con Escape ni al hacer clic fuera: el secreto no se vuelve a mostrar -->
  <div class="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="secreto-titulo"
      class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
    >
      <span class="grid size-12 place-items-center rounded-full bg-blue-50 text-brand-dark">
        <KeyRound class="size-6" aria-hidden="true" />
      </span>
      <h2 id="secreto-titulo" class="mt-5 text-xl font-bold text-ink">{{ titulo }}</h2>
      <p class="mt-2 text-sm leading-6 text-muted">
        Este secreto permite que el nodo se conecte a SafeCore. Cópialo ahora y guárdalo en el nodo:
        <strong class="text-body">no se volverá a mostrar</strong>.
      </p>

      <div class="mt-5 break-all rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-ink">
        {{ secreto }}
      </div>

      <div class="mt-7 flex justify-end gap-3">
        <AppButton variant="secondary" :icon="copiado ? Check : Copy" @click="copiar(secreto)">
          {{ copiado ? "Copiado" : "Copiar secreto" }}
        </AppButton>
        <AppButton @click="emit('cerrar')">Ya lo guardé</AppButton>
      </div>
    </section>
  </div>
</template>
