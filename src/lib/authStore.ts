import { useSyncExternalStore } from 'react'
import {
  registerNewBusinessBar,
  loadBarData,
  DEFAULT_BAR_DATA,
  applyCloudBarDataLocally,
  smartSyncWithCloud,
} from '@/lib/barState'
import {
  checkCloudEmailExists,
  registerCloudAccount,
  loginCloudAccount,
  getCloudTeamMembers,
  saveCloudTeamMember,
  deleteCloudTeamMember,
  archiveAndDeleteCloudAccount,
  DeletedCloudAccountRecord,
} from '@/lib/supabaseClient'

export type UserRole = 'owner' | 'admin' | 'staff'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleTitle: string
  avatar: string
  photoUrl?: string
  pin: string
  barName?: string
  phone?: string
  city?: string
  businessId?: string
}

// Interfaz para crear nuevos usuarios (solo owner)
export interface NewUserFormData {
  name: string
  email: string
  role: UserRole
  roleTitle: string
  temporaryPin?: string
}

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
const USERS_STORAGE_KEY = 'ROCK_BAR_USERS_STORE_V2'

// Obtener la lista de usuarios pertenecientes al bar actual (100% aislada)
export function getBarUsers(): AuthUser[] {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const currentSession = getAuthState().user
    const isCustomBar = Boolean(
      currentSession && (currentSession.barName || currentSession.id.startsWith('user-business-') || currentSession.id.startsWith('new-'))
    )

    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AuthUser[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (isCustomBar) {
          // Filtrar estrictamente cualquier usuario residual de demostración de Rock Bar
          const filtered = parsed.filter(
            (u) => !['user-owner-1', 'user-admin-1', 'user-staff-1'].includes(u.id)
          )
          if (filtered.length > 0) {
            // Asegurar que el usuario activo propietario esté en la lista
            const hasCurrent = filtered.some((u) => u.id === currentSession?.id || u.email === currentSession?.email)
            if (!hasCurrent && currentSession) {
              filtered.unshift(currentSession)
              saveBarUsers(filtered)
            }
            return filtered
          }
          if (currentSession) {
            saveBarUsers([currentSession])
            return [currentSession]
          }
        }
        return parsed
      }
    }

    // Si no hay lista en USERS_STORAGE_KEY pero hay sesión activa
    if (currentSession) {
      const initialUsers = [currentSession]
      saveBarUsers(initialUsers)
      return initialUsers
    }
  } catch (err) {
    console.error('Error cargando usuarios del bar:', err)
  }
  return []
}

// Guardar lista de usuarios aislada del bar
export function saveBarUsers(users: AuthUser[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      window.dispatchEvent(new Event('rock_bar_users_updated'))
    } catch (err) {
      console.error('Error guardando usuarios del bar:', err)
    }
  }
}

// Agregar un empleado (mesero o admin) al bar actual
export function addBarMember(data: { name: string; email?: string; role: UserRole; pin: string }): AuthUser {
  const currentUsers = getBarUsers()
  const currentSession = getAuthState().user
  const roleTitle = data.role === 'admin' ? 'Administrador / Gerente' : 'Mesero / Staff'
  const newMember: AuthUser = {
    id: `user-${data.role}-${Date.now()}`,
    name: data.name.trim(),
    email: data.email?.trim() || `${data.name.trim().toLowerCase().replace(/\s+/g, '')}@bar.com`,
    role: data.role,
    roleTitle,
    avatar: data.name.trim().slice(0, 2).toUpperCase(),
    pin: data.pin.trim(),
    barName: currentSession?.barName,
    businessId: currentSession?.businessId,
  }
  const updated = [...currentUsers, newMember]
  saveBarUsers(updated)

  // Sincronizar en la nube en segundo plano si hay businessId
  if (currentSession?.businessId) {
    saveCloudTeamMember({
      id: newMember.id,
      business_id: currentSession.businessId,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      role_title: newMember.roleTitle,
      pin: newMember.pin,
      avatar: newMember.avatar,
    }).catch((err) => console.warn('Error sincronizando miembro en la nube:', err))
  }

  return newMember
}

// Eliminar un miembro del personal del bar
export function deleteBarMember(userId: string): void {
  const currentUsers = getBarUsers()
  const filtered = currentUsers.filter((u) => u.id !== userId)
  saveBarUsers(filtered)
  deleteCloudTeamMember(userId).catch((err) => console.warn('Error eliminando miembro en la nube:', err))
}

export const DEFAULT_AUTH_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
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

// Actualizar foto de perfil o logotipo del usuario
export function updateUserPhoto(photoUrl: string): void {
  const current = getAuthState()
  if (current.user) {
    const updatedUser: AuthUser = {
      ...current.user,
      photoUrl,
    }
    setAuthState({
      ...current,
      user: updatedUser,
    })
    const users = getBarUsers()
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    saveBarUsers(updatedUsers)
  }
}

// Registrar un nuevo bar y su propietario (Onboarding SaaS con validación central en Supabase)
export async function registerBusinessOwner(params: {
  firstName: string
  lastName: string
  barName: string
  email: string
  passwordOrPin: string
  phone?: string
  city?: string
}): Promise<AuthUser> {
  const cleanEmail = params.email.trim().toLowerCase()
  const fullName = `${params.firstName.trim()} ${params.lastName.trim()}`
  const initials = `${params.firstName.trim()[0] || 'B'}${params.lastName.trim()[0] || 'P'}`.toUpperCase()

  // 1. Validar si el correo ya está registrado en la nube (comprobación multi-dispositivo)
  const isDuplicate = await checkCloudEmailExists(cleanEmail)
  if (isDuplicate) {
    throw new Error(
      `El correo "${cleanEmail}" ya se encuentra registrado con otro bar. Por favor inicia sesión con tu contraseña o PIN.`
    )
  }

  // 2. Registrar en Supabase Cloud para persistencia entre diferentes portátiles
  let businessId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `biz-${Date.now()}`
  const cloudRes = await registerCloudAccount(params)
  if (cloudRes.success && cloudRes.account) {
    businessId = cloudRes.account.business_id
  } else if (cloudRes.error && cloudRes.error.includes('ya está registrado')) {
    throw new Error(cloudRes.error)
  }

  const newUser: AuthUser = {
    id: 'owner-' + Date.now(),
    name: fullName,
    email: cleanEmail,
    role: 'owner',
    roleTitle: `Propietario (${params.barName.trim()})`,
    avatar: initials,
    pin: params.passwordOrPin.trim(),
    barName: params.barName.trim(),
    phone: params.phone?.trim(),
    city: params.city?.trim(),
    businessId: businessId,
  }

  // Lista de usuarios NUEVA y AISLADA para este bar: SOLO el nuevo propietario
  saveBarUsers([newUser])

  // Activar sesión ANTES de inicializar los datos del bar para que saveBarData tenga acceso inmediato al businessId
  setAuthState({
    user: newUser,
    isAuthenticated: true,
  })

  // Sincronizar en barState el nuevo negocio y nombre del bar con plataforma en 0
  registerNewBusinessBar({
    barName: params.barName,
    ownerName: fullName,
    phone: params.phone,
    city: params.city,
    businessId: businessId,
  })

  return newUser
}

// Función para login con creación de usuario custom (por el owner en el panel)
export function loginWithNewUser(name: string, role: UserRole): AuthUser {
  const tempPin = Math.floor(1000 + Math.random() * 9000).toString()
  const newUser: AuthUser = {
    id: 'new-' + Date.now(),
    name: name.trim(),
    email: `${name.trim().toLowerCase().replace(/\s+/g, '')}@bar.com`,
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

// Autenticación con credenciales validando en la nube (permite acceso desde cualquier portátil o PC de mesa)
export async function loginWithCredentials(
  identifier: string,
  pinOrPass: string
): Promise<{ success: boolean; message?: string; user?: AuthUser }> {
  const cleanId = identifier.trim()
  const cleanPass = pinOrPass.trim()

  // 1. Validar credenciales contra Supabase en la nube y descargar inmediatamente el estado operativo del bar
  try {
    const cloudRes = await loginCloudAccount(cleanId, cleanPass)
    if (cloudRes.success && cloudRes.user) {
      setAuthState({
        user: cloudRes.user,
        isAuthenticated: true,
      })

      // Si la nube ya devolvió el snapshot de bar_data del otro computador (portátil), aplicarlo de inmediato antes de entrar
      if (cloudRes.barData) {
        applyCloudBarDataLocally(cloudRes.barData)
      } else {
        await smartSyncWithCloud()
      }

      // Sincronizar lista de usuarios del bar en este navegador
      const localUsers = getBarUsers()
      const filteredLocal = localUsers.filter(
        (u) => !['user-owner-1', 'user-admin-1', 'user-staff-1'].includes(u.id)
      )
      const hasCloudUser = filteredLocal.some(
        (u) => u.id === cloudRes.user!.id || u.email.toLowerCase() === cloudRes.user!.email.toLowerCase()
      )
      const updatedLocalUsers = hasCloudUser
        ? filteredLocal.map((u) =>
            u.id === cloudRes.user!.id || u.email.toLowerCase() === cloudRes.user!.email.toLowerCase()
              ? cloudRes.user!
              : u
          )
        : [cloudRes.user, ...filteredLocal]
      saveBarUsers(updatedLocalUsers)

      // Descargar también los miembros del equipo desde la nube en segundo plano
      if (cloudRes.user.businessId) {
        getCloudTeamMembers(cloudRes.user.businessId)
          .then((members) => {
            if (members && members.length > 0) {
              const mapped: AuthUser[] = members.map((m) => ({
                id: m.id,
                name: m.name,
                email: m.email || '',
                role: m.role,
                roleTitle:
                  m.role_title || (m.role === 'admin' ? 'Administrador / Gerente' : 'Mesero / Staff'),
                avatar: m.avatar || m.name.slice(0, 2).toUpperCase(),
                pin: m.pin,
                barName: cloudRes.user?.barName,
                businessId: cloudRes.user?.businessId,
              }))
              saveBarUsers([
                cloudRes.user!,
                ...mapped.filter((m) => m.id !== cloudRes.user!.id),
              ])
            }
          })
          .catch(() => {})
      }

      return { success: true, user: cloudRes.user }
    }
  } catch (err) {
    console.warn('Consulta a Supabase en login falló, probando caché local:', err)
  }

  // 2. Fallback local por si el equipo está temporalmente sin internet
  const barUsers = getBarUsers()
  const candidates = barUsers.length > 0 ? barUsers : PRESET_USERS
  const found =
    candidates.find((u) => {
      const idMatch =
        cleanId.length > 0 &&
        (u.email.toLowerCase() === cleanId.toLowerCase() ||
          u.name.toLowerCase().includes(cleanId.toLowerCase()) ||
          (u.barName && u.barName.toLowerCase().includes(cleanId.toLowerCase())))
      const pinMatch = cleanPass.length > 0 && u.pin === cleanPass
      if (cleanId.length > 0 && cleanPass.length > 0) return idMatch && pinMatch
      if (cleanId.length === 0 && cleanPass.length > 0) return pinMatch
      return idMatch
    }) ||
    PRESET_USERS.find(
      (u) =>
        (cleanId.length > 0 && u.email.toLowerCase() === cleanId.toLowerCase() && u.pin === cleanPass) ||
        (cleanId.length === 0 && u.pin === cleanPass)
    )

  if (found) {
    setAuthState({
      user: found,
      isAuthenticated: true,
    })
    await smartSyncWithCloud()
    return { success: true, user: found }
  }

  return {
    success: false,
    message:
      'No encontramos una cuenta con esos datos. Ingresa el correo, tu nombre (ej. Jesus Arias) o el nombre del bar (ej. YIsus Bar) junto con tu PIN/contraseña.',
  }
}

const DELETED_ACCOUNTS_STORAGE_KEY = 'ROCK_BAR_DELETED_ACCOUNTS_V1'

export function getLocalDeletedAccounts(): DeletedCloudAccountRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(DELETED_ACCOUNTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Eliminar cuenta comercial o de usuario con verificación obligatoria de PIN y archivo en base de datos de usuarios eliminados
export async function deleteAccountWithPinVerification(params: {
  pinInput: string
  reason: string
}): Promise<{ success: boolean; message: string }> {
  const current = getAuthState()
  const activeUser = current.user

  if (!activeUser) {
    return {
      success: false,
      message: 'No hay una sesión activa para eliminar.',
    }
  }

  const cleanPin = params.pinInput.trim()
  if (!cleanPin) {
    return {
      success: false,
      message: 'Debes ingresar tu PIN o contraseña para verificar la eliminación.',
    }
  }

  // Verificar que el PIN ingresado coincida exactamente con el PIN del usuario/propietario activo
  if (cleanPin !== activeUser.pin) {
    return {
      success: false,
      message: 'PIN de seguridad incorrecto. No se autorizó la eliminación de la cuenta.',
    }
  }

  const finalSnapshot = loadBarData()
  const deletedRecord: DeletedCloudAccountRecord = {
    id: 'del-' + Date.now(),
    original_account_id: activeUser.id,
    business_id: activeUser.businessId || 'local-business',
    email: activeUser.email,
    full_name: activeUser.name,
    bar_name: activeUser.barName || finalSnapshot.settings?.barName || 'MI BAR',
    phone: activeUser.phone || finalSnapshot.settings?.phone || '',
    city: activeUser.city || '',
    deletion_reason: params.reason.trim() || 'Eliminación solicitada y verificada con PIN por el titular',
    pin_verified: true,
    deleted_at: new Date().toLocaleString('es-CO'),
  }

  // 1. Guardar en el registro local de cuentas eliminadas (auditoría inmediata)
  if (typeof window !== 'undefined') {
    const prevDeleted = getLocalDeletedAccounts()
    localStorage.setItem(DELETED_ACCOUNTS_STORAGE_KEY, JSON.stringify([deletedRecord, ...prevDeleted]))
  }

  // 2. Archivar en la base de datos de usuarios eliminados (deleted_bar_accounts) en Supabase y borrar de bar_accounts activa
  await archiveAndDeleteCloudAccount({
    user: activeUser,
    reason: deletedRecord.deletion_reason,
    finalSnapshot,
  })

  // 3. Limpiar datos locales de la cuenta eliminada y cerrar sesión
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USERS_STORAGE_KEY)
    localStorage.setItem('ROCK_BAR_APP_STATE_V1', JSON.stringify(DEFAULT_BAR_DATA))
    window.dispatchEvent(new Event('rock_bar_state_updated'))
  }

  logout()

  return {
    success: true,
    message: `La cuenta de "${deletedRecord.bar_name}" (${activeUser.email}) fue verificada con PIN, archivada en la base de datos de usuarios eliminados y eliminada del sistema activo.`,
  }
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
