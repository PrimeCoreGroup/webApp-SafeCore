import { ref } from 'vue'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

// Module-level singleton — shared across all components
const toasts = ref<Toast[]>([])

export function useToast() {
  function add(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID()
    toasts.value.push({ ...toast, id })
    setTimeout(() => remove(id), 4000)
  }

  function remove(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return { toasts, add, remove }
}
