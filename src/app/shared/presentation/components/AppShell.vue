<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { Bell, LogOut, Menu, ShieldCheck, X } from "@lucide/vue";
import { navigation } from "@/app/shared/presentation/config/navigation";
import { useAuth } from "@/app/shared/composables/useAuth";
import { getAlertas } from "@/app/alertas/data/alertas.service";

const route = useRoute();
const { user, initials, logout } = useAuth();

const sidebarOpen = ref(false);
const hasActiveAlerts = ref(false);

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? "");

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`);
}

watch(() => route.path, () => (sidebarOpen.value = false));

onMounted(async () => {
  const alertas = await getAlertas().catch(() => []);
  hasActiveAlerts.value = alertas.some((a) => a.estado === "activa");
});
</script>

<template>
  <div class="min-h-screen bg-surface text-body">
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-white transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <RouterLink to="/dashboard" class="flex h-20 items-center gap-3 border-b border-white/10 px-6 text-xl font-bold">
        <span class="grid size-10 place-items-center rounded-xl bg-brand">
          <ShieldCheck class="size-5" aria-hidden="true" />
        </span>
        SafeCore
      </RouterLink>

      <nav class="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Navegación principal">
        <p class="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Navegación</p>
        <RouterLink
          v-for="item in navigation"
          :key="item.route"
          :to="item.route"
          :class="[
            'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition',
            isActive(item.route) ? 'bg-brand text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white',
          ]"
        >
          <component :is="item.icon" class="size-5" aria-hidden="true" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-white/10 p-4">
        <div class="mb-3 flex items-center gap-3 rounded-lg px-2 py-2">
          <span class="grid size-9 place-items-center rounded-full bg-[#2D2D2D] text-sm font-bold">{{ initials }}</span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold">{{ user?.name }}</span>
            <span class="block text-xs text-slate-400">Administrador</span>
          </span>
        </div>
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/10 hover:text-white"
          @click="logout"
        >
          <LogOut class="size-4" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <header
      class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:ml-64 lg:h-20 lg:px-8"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="grid size-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          :aria-label="sidebarOpen ? 'Cerrar menú' : 'Abrir menú'"
          @click="sidebarOpen = !sidebarOpen"
        >
          <component :is="sidebarOpen ? X : Menu" class="size-5" aria-hidden="true" />
        </button>
        <p class="font-bold text-ink">{{ pageTitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink
          to="/alertas"
          aria-label="Ver alertas"
          class="relative grid size-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Bell class="size-5" aria-hidden="true" />
          <span v-if="hasActiveAlerts" class="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-white" />
        </RouterLink>
        <span class="hidden text-sm font-semibold sm:inline">{{ user?.name }}</span>
        <span class="grid size-9 place-items-center rounded-full bg-ink text-xs font-bold text-white">{{ initials }}</span>
      </div>
    </header>

    <main class="lg:ml-64">
      <div class="mx-auto max-w-7xl p-5 sm:p-8">
        <RouterView :key="route.fullPath" />
      </div>
    </main>
  </div>
</template>
