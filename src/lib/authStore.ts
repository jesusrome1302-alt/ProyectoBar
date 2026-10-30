import { useSyncExternalStore } from 'react'
import { registerNewBusinessBar } from '@/lib/barState'

export type UserRole = 'owner' | 'admin' | 'staff'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleTitle: string
  avatar: string
  pin: string
  barName?: string
  phone?: string
  city?: string
}

// Interfaz para crear nuevos usuarios (solo owner)
export interface NewUserFormData {
  name: string
  email: string
  role: UserRole
  roleTitle: string
  temporaryPin?: string
}

// Expandir PRESET_USERS con funcionalidad de creación
export const PRESET_USERS: AuthUser[] = [
  {
    id: 'user-owner-1',
    name: 'Carlos Santana',
    email: 'owner@rockbar.com',
    role: 'owner',
    roleTitle: 'Propietario / Dueño',
    avatar: 'CS',
    pin: '1111',
  },
  {
    id: 'user-admin-1',
    name: 'Andrés Calamaro',
    email: 'admin@rockbar.com',
    role: 'admin',
    roleTitle: 'Administrador / Gerente',
    avatar: 'AC',
    pin: '2222',
  },
  {
    id: 'user-staff-1',
    name: 'Fito Páez',
    email: 'staff@rockbar.com',
    role: 'staff',
    roleTitle: 'Mesero / Bartender',
    avatar: 'FP',
    pin: '3333',
  },
]

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
}

const AUTH_STORAGE_KEY = 'ROCK_BAR_AUTH_SESSION_V1'

// Nuevo usuario creado temporalmente (será persistido en localStorage)
let tempUserIdCounter = 1000

// Función para crear un nuevo usuario (solo puede ser llamada por el owner)
export function createNewUser(formData: NewUserFormData, creatorRole: UserRole): AuthUser {
  // Verificar que el creador sea owner
  if (creatorRole !== 'owner') {
    throw new Error('Solo el propietario puede crear nuevos usuarios')
  }

  const newId = `user-${formData.role}-${tempUserIdCounter++}`
  const newUser: AuthUser = {
    id: newId,
    name: formData.name,
    email: formData.email,
    role: formData.role,
    roleTitle: formData.roleTitle || `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} / Personal`,
    avatar: formData.name.slice(0, 2).toUpperCase(),
    pin: formData.temporaryPin || Math.floor(1000 + Math.random() * 9000).toString(),
  }

  return newUser
}

export const DEFAULT_AUTH_STATE: AuthState = {
  user: PRESET_USERS[0],
  isAuthenticated: true,
}

let currentAuthState: AuthState = DEFAULT_AUTH_STATE
let cachedRaw: string | null = null
const authListeners = new Set<() => void>()

export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return DEFAULT_AUTH_STATE
  }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_AUTH_STATE
    }
    // Si el contenido crudo no cambió, retornar la MISMA referencia en memoria para evitar renders infinitos
    if (raw === cachedRaw && currentAuthState) {
      return currentAuthState
    }
    cachedRaw = raw
    const parsed = JSON.parse(raw) as AuthState
    if (parsed && parsed.user) {
      currentAuthState = parsed
      return currentAuthState
    }
  } catch (err) {
    console.error('Error al leer sesión de usuario:', err)
  }
  return DEFAULT_AUTH_STATE
}

export function setAuthState(newState: AuthState): void {
  currentAuthState = newState
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.stringify(newState)
      cachedRaw = raw
      localStorage.setItem(AUTH_STORAGE_KEY, raw)
      if (newState.user) {
        localStorage.setItem('userRole', newState.user.role)
        localStorage.setItem('userName', newState.user.name)
      } else {
        localStorage.removeItem('userRole')
        localStorage.removeItem('userName')
      }
    } catch (err) {
      console.error('Error guardando sesión:', err)
    }
    window.dispatchEvent(new Event('rock_bar_auth_updated'))
  }
  authListeners.forEach((listener) => listener())
}

export function loginWithPreset(role: UserRole): AuthUser {
  const targetUser = PRESET_USERS.find((u) => u.role === role) || PRESET_USERS[0]
  setAuthState({
    user: targetUser,
    isAuthenticated: true,
  })
  return targetUser
}

// Registrar un nuevo bar y su propietario (Onboarding SaaS para bares pequeños)
export function registerBusinessOwner(params: {
  firstName: string
  lastName: string
  barName: string
  email: string
  passwordOrPin: string
  phone?: string
  city?: string
}): AuthUser {
  const fullName = `${params.firstName.trim()} ${params.lastName.trim()}`
  const initials = `${params.firstName.trim()[0] || 'B'}${params.lastName.trim()[0] || 'P'}`.toUpperCase()

  const newUser: AuthUser = {
    id: 'owner-' + Date.now(),
    name: fullName,
    email: params.email.trim().toLowerCase(),
    role: 'owner',
    roleTitle: `Propietario (${params.barName.trim()})`,
    avatar: initials,
    pin: params.passwordOrPin.trim(),
    barName: params.barName.trim(),
    phone: params.phone?.trim(),
    city: params.city?.trim(),
  }

  // Agregar al inicio de perfiles activos
  const existingIdx = PRESET_USERS.findIndex((u) => u.email === newUser.email)
  if (existingIdx >= 0) {
    PRESET_USERS[existingIdx] = newUser
  } else {
    PRESET_USERS.unshift(newUser)
  }

  // Sincronizar en barState el nuevo negocio y nombre del bar
  registerNewBusinessBar({
    barName: params.barName,
    ownerName: fullName,
    phone: params.phone,
    city: params.city,
  })

  // Activar sesión inmediatamente
  setAuthState({
    user: newUser,
    isAuthenticated: true,
  })

  return newUser
}

// Función para login con creación de usuario custom (por el owner en el panel)
export function loginWithNewUser(name: string, role: UserRole): AuthUser {
  const tempPin = Math.floor(1000 + Math.random() * 9000).toString()
  const newUser: AuthUser = {
    id: 'new-' + Date.now(),
    name: name.trim(),
    email: `${name.trim().toLowerCase().replace(/\s+/g, '')}@rockbar.com`,
    role: role,
    roleTitle: `${role.charAt(0).toUpperCase() + role.slice(1)} / Personal`,
    avatar: name.trim().slice(0, 2).toUpperCase(),
    pin: tempPin,
  }
  setAuthState({
    user: newUser,
    isAuthenticated: true,
  })
  return newUser
}

// Mejorado loginWithCredentials con mejor validación
export function loginWithCredentials(identifier: string, pinOrPass: string): { success: boolean; message?: string; user?: AuthUser } {
  // Buscar por email o PIN en users preset
  const found = PRESET_USERS.find(
    (u) =>
      u.email.toLowerCase() === identifier.trim().toLowerCase() ||
      u.pin === pinOrPass.trim() ||
      u.name.toLowerCase().includes(identifier.trim().toLowerCase())
  )

  if (found) {
    setAuthState({
      user: found,
      isAuthenticated: true,
    })
    return { success: true, user: found }
  }

  // Si no coincide, crear usuario custom staff (compatibilidad hacia atrás)
  if (identifier.trim().length > 0) {
    const customUser: AuthUser = {
      id: 'custom-' + Date.now(),
      name: identifier.trim(),
      email: `${identifier.trim().toLowerCase().replace(/\s+/g, '')}@rockbar.com`,
      role: 'staff',
      roleTitle: 'Personal de Turno',
      avatar: identifier.trim().slice(0, 2).toUpperCase(),
      pin: pinOrPass || '0000',
    }
    setAuthState({
      user: customUser,
      isAuthenticated: true,
    })
    return { success: true, user: customUser }
  }

  return { success: false, message: 'Usuario o credenciales inválidas' }
}

export function logout(): void {
  setAuthState({
    user: null,
    isAuthenticated: false,
  })
}

function subscribeAuth(callback: () => void) {
  authListeners.add(callback)
  const handler = () => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (raw !== cachedRaw) {
        cachedRaw = raw
        if (raw) {
          try {
            currentAuthState = JSON.parse(raw)
          } catch {
            currentAuthState = DEFAULT_AUTH_STATE
          }
        }
      }
    }
    callback()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('rock_bar_auth_updated', handler)
    window.addEventListener('storage', handler)
  }
  return () => {
    authListeners.delete(callback)
    if (typeof window !== 'undefined') {
      window.removeEventListener('rock_bar_auth_updated', handler)
      window.removeEventListener('storage', handler)
    }
  }
}

export function useAuthStore(): AuthState {
  return useSyncExternalStore(subscribeAuth, getAuthState, () => DEFAULT_AUTH_STATE)
}
