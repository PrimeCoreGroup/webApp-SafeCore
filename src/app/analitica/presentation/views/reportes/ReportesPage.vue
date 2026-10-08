<script setup lang="ts">
import { useRouter } from "vue-router";
import { ChartColumn, FileText } from "@lucide/vue";
import AppButton from "@/app/shared/components/ui/AppButton.vue";
import AppCard from "@/app/shared/components/ui/AppCard.vue";
import BackButton from "@/app/shared/components/ui/BackButton.vue";
import LoadingState from "@/app/shared/components/ui/LoadingState.vue";
import PageTitle from "@/app/shared/components/ui/PageTitle.vue";
import { useAsyncData } from "@/app/shared/composables/useAsyncData";
import { getReportes } from "../../../data/analitica.service";

const router = useRouter();
const { data: reportes, loading, error, reload } = useAsyncData(getReportes);
</script>

<template>
  <BackButton :to="{ name: 'analitica' }" />
  <PageTitle title="Reportes" description="Reportes disponibles por periodo y ubicación." />

  <LoadingState :loading="loading" :error="error" @retry="reload">
    <div class="grid gap-4 md:grid-cols-3">
      <AppCard v-for="reporte in reportes" :key="reporte.id">
        <span class="grid size-11 place-items-center rounded-lg bg-blue-50 text-brand-dark">
          <FileText class="size-5" aria-hidden="true" />
        </span>
        <h2 class="mt-5 font-bold">{{ reporte.nombre }}</h2>
        <div class="mt-3 space-y-2 text-sm text-muted">
          <p><span class="font-semibold text-body">Periodo:</span> {{ reporte.periodo }}</p>
          <p><span class="font-semibold text-body">Ubicación:</span> {{ reporte.ubicacion }}</p>
          <p><span class="font-semibold text-body">Tipo:</span> {{ reporte.tipo }}</p>
        </div>
        <div class="mt-5">
          <AppButton variant="secondary" :icon="ChartColumn" @click="router.push({ name: 'tendencias' })">
            Consultar tendencias
          </AppButton>
        </div>
      </AppCard>
    </div>
  </LoadingState>
</template>
