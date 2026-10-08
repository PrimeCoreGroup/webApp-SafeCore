import { onMounted, ref, type Ref } from 'vue'

// Carga datos al montar y expone loading, error y reload
export function useAsyncData<T>(loader: () => Promise<T>) {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function reload() {
    loading.value = true
    error.value = null
    try {
      data.value = await loader()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudo cargar la información'
    } finally {
      loading.value = false
    }
  }

  onMounted(reload)

  return { data, loading, error, reload }
}
