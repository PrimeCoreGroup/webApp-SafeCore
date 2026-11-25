<script setup lang="ts">
import { ref } from "vue";
import { Eye, EyeOff } from "@lucide/vue";
import { inputClass } from "./form-classes";

defineProps<{ autocomplete?: string; placeholder?: string; grande?: boolean }>();
const model = defineModel<string>({ required: true });

// Siempre empieza oculta
const visible = ref(false);
</script>

<template>
  <div class="relative">
    <input
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :class="[inputClass, 'pr-11', grande ? 'h-12' : '']"
    />
    <button
      type="button"
      :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      :aria-pressed="visible"
      :title="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      class="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-brand"
      @click="visible = !visible"
    >
      <component :is="visible ? EyeOff : Eye" class="size-5" aria-hidden="true" />
    </button>
  </div>
</template>
