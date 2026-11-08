<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive } from "vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import FormField from "@/app/shared/components/ui/FormField.vue";
import { inputClass } from "@/app/shared/components/ui/form-classes";
import { ACTUADOR_TIPOS, ACTUADOR_UI, COMPONENTE_ESTADO_UI, SENSOR_TIPOS, SENSOR_UI } from "../config/nodo-ui";
import type { ClaseComponente, ComponenteInput, ComponenteNodo, EstadoComponente } from "../models/nodo";

const props = defineProps<{
  clase: ClaseComponente;
  componente: ComponenteNodo | null;
  guardando: boolean;
  error: string | null;
}>();
const emit = defineEmits<{ guardar: [ComponenteInput]; cancelar: [] }>();

const editando = computed(() => !!props.componente);

const tipos = computed(() =>
  props.clase === "sensor"
    ? SENSOR_TIPOS.map((t) => ({ value: t, label: SENSOR_UI[t].label }))
    : ACTUADOR_TIPOS.map((t) => ({ value: t, label: ACTUADOR_UI[t].label })),
);

const form = reactive({
  tipo: (props.componente?.tipo ?? tipos.value[0]!.value) as ComponenteInput["tipo"],
  nombre: props.componente?.nombre ?? "",
  canal: props.componente?.canal ?? "",
  estado: (props.componente?.estado ?? "disconnected") as EstadoComponente,
});
const errorNombre = reactive({ valor: "" });

function guardar() {
  errorNombre.valor = form.nombre.trim() ? "" : "Ingresa un nombre";
  if (errorNombre.valor) return;
  emit("guardar", {
    clase: props.clase,
    tipo: form.tipo,
    nombre: form.nombre.trim(),
    canal: form.canal.trim() || null,
    estado: form.estado,
  });
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
      aria-labelledby="componente-titulo"
      class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      novalidate
      @submit.prevent="guardar"
    >
      <h2 id="componente-titulo" class="text-xl font-bold text-ink">
        {{ editando ? "Editar" : "Agregar" }} {{ clase === "sensor" ? "sensor" : "actuador" }}
      </h2>

      <div class="mt-5 space-y-4">
        <FormField label="Nombre" :error="errorNombre.valor" hint="Identifica al componente dentro del nodo, por ejemplo su ubicación.">
          <input v-model="form.nombre" maxlength="100" :class="inputClass" placeholder="Sensor de la cocina" />
        </FormField>
        <FormField label="Tipo">
          <select v-model="form.tipo" :class="inputClass">
            <option v-for="tipo in tipos" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option>
          </select>
        </FormField>
        <FormField label="Canal o pin" hint="Opcional. Distingue componentes del mismo tipo en el controlador.">
          <input v-model="form.canal" maxlength="100" :class="inputClass" placeholder="GPIO 4" />
        </FormField>
        <FormField label="Estado">
          <select v-model="form.estado" :class="inputClass">
            <option v-for="(ui, estado) in COMPONENTE_ESTADO_UI" :key="estado" :value="estado">{{ ui.label }}</option>
          </select>
        </FormField>
      </div>

      <p v-if="error" class="mt-4 text-sm font-medium text-danger" role="alert">{{ error }}</p>

      <div class="mt-7 flex justify-end gap-3">
        <AppButton variant="secondary" @click="emit('cancelar')">Cancelar</AppButton>
        <AppButton type="submit" :loading="guardando">{{ editando ? "Guardar cambios" : "Agregar" }}</AppButton>
      </div>
    </form>
  </div>
</template>
