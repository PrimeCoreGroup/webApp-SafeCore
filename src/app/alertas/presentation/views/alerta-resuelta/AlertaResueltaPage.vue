<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Check } from "@lucide/vue";
import AppBadge from "@/app/shared/components/ui/AppBadge.vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getAlerta } from "../../../data/alertas.service";

const route = useRoute();
const router = useRouter();
const { data: alerta, loading, error, reload } = useAsyncData(() => getAlerta(route.params.id as string));
</script>

<template>
  <LoadingState :loading="loading" :error="error" @retry="reload">
    <div v-if="alerta" class="mx-auto max-w-2xl py-10">
      <AppCard class="text-center">
        <span class="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-success">
          <Check class="size-9" aria-hidden="true" />
        </span>
        <h1 class="mt-6 text-3xl font-bold text-ink">Alerta resuelta</h1>
        <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          La alerta “{{ alerta.evento }}” fue marcada correctamente como resuelta.
        </p>
        <div class="mt-5">
          <AppBadge tone="success" :icon="Check">Resuelta</AppBadge>
        </div>
        <div class="mt-8">
          <AppButton :icon="ArrowLeft" @click="router.push({ name: 'alertas' })">Volver a Alertas</AppButton>
        </div>
      </AppCard>
    </div>
  </LoadingState>
</template>
