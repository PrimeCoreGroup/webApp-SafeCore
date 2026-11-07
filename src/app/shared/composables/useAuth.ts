import { ref, computed } from 'vue'
import { clearToken, clearUser, getUser, setUser, type StoredUser } from '@/lib/api'

// Estado compartido
const user = ref<StoredUser | null>(getUser())

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.roles.includes('Administrator') ?? false)
  const initials = computed(() =>
    (user.value?.name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(''),
  )

  function login(authUser: StoredUser) {
    user.value = authUser
    setUser(authUser)
  }

  function logout() {
    user.value = null
    clearUser()
    clearToken()
    window.location.href = '/login'
  }

  return { user, isAuthenticated, isAdmin, initials, login, logout }
}
