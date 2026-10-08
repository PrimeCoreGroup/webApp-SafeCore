<script setup lang="ts">
import { useRouter } from "vue-router";
import { CircleCheck, Info, Pencil, Plus } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getUsuarios } from "../../../data/usuarios.service";
import { ROL_LABEL, type Usuario } from "../../models/usuario";

const router = useRouter();
const { data: usuarios, loading, error, reload } = useAsyncData(getUsuarios);

function iniciales(usuario: Usuario) {
  return usuario.nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
</script>

<template>
  <PageTitle title="Usuarios" description="Gestión de usuarios y roles.">
    <template #action>
      <AppButton :icon="Plus" @click="router.push({ name: 'usuario-nuevo' })">Agregar usuario</AppButton>
    </template>
  </PageTitle>

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <AppCard flush>
      <div
        class="hidden grid-cols-[1.4fr_1fr_1fr_auto] gap-4 border-b bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted sm:grid"
      >
        <span>Usuario</span>
        <span>Rol</span>
        <span>Estado</span>
        <span>Acciones</span>
      </div>

      <p v-if="!usuarios?.length" class="px-5 py-10 text-center text-sm text-muted">Aún no hay usuarios.</p>

      <div
        v-for="usuario in usuarios"
        :key="usuario.id"
        class="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center"
      >
        <div class="flex items-center gap-3">
          <span class="grid size-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-brand-dark">
            {{ iniciales(usuario) }}
          </span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold">{{ usuario.nombre }}</span>
            <span class="block truncate text-xs text-muted">{{ usuario.email }}</span>
          </span>
        </div>
        <span class="text-sm text-muted">{{ ROL_LABEL[usuario.rol] }}</span>
        <span>
          <AppBadge
            :tone="usuario.estado === 'activo' ? 'success' : 'neutral'"
            :icon="usuario.estado === 'activo' ? CircleCheck : Info"
          >
            {{ usuario.estado === "activo" ? "Activo" : "Inactivo" }}
          </AppBadge>
        </span>
        <AppButton
          variant="ghost"
          :icon="Pencil"
          @click="router.push({ name: 'usuario-editar', params: { id: usuario.id } })"
        >
          Editar
        </AppButton>
      </div>
    </AppCard>
  </LoadingState>
</template>
