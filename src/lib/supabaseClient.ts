import { createClient } from '@supabase/supabase-js'
import type { UserRole, AuthUser } from './authStore'
import type { BarData } from './barState'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spmzbzqkemfgdjxdoxyr.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_0Ckq-ycF7I3vTQcCqbScIQ_H9D4tNSw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface CloudAccount {
  id: string
  email: string
  password?: string
  pin: string
  full_name: string
  bar_name: string
  phone?: string
  city?: string
  role: UserRole
  business_id: string
  created_at?: string
}

export interface CloudTeamMember {
  id: string
  business_id: string
  name: string
  email?: string
  role: UserRole
  role_title?: string
  pin: string
  avatar?: string
  created_at?: string
}

// 1. Verificar si un correo ya está registrado en la nube
export async function checkCloudEmailExists(email: string): Promise<boolean> {
  if (!email || !email.includes('@')) return false
  try {
    const { data, error } = await supabase
      .from('bar_accounts')
      .select('id')
      .ilike('email', email.trim())
      .maybeSingle()

    if (error) {
      console.warn('Verificación de correo en la nube:', error.message)
      return false
    }
    return Boolean(data)
  } catch (err) {
    console.warn('Error conectando a Supabase para verificar correo:', err)
    return false
  }
}

// 2. Registrar un nuevo Bar y su Propietario en la nube
export async function registerCloudAccount(params: {
  firstName: string
  lastName: string
  barName: string
  email: string
  passwordOrPin: string
  phone?: string
  city?: string
}): Promise<{ success: boolean; account?: CloudAccount; error?: string }> {
  try {
    const cleanEmail = params.email.trim().toLowerCase()

    // Comprobar duplicado en la nube
    const exists = await checkCloudEmailExists(cleanEmail)
    if (exists) {
      return {
        success: false,
        error: `El correo "${cleanEmail}" ya está registrado con otro bar. Por favor inicia sesión con tu contraseña o PIN.`,
      }
    }

    const fullName = `${params.firstName.trim()} ${params.lastName.trim()}`
    const businessId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `biz-${Date.now()}`

    const newAccount = {
      email: cleanEmail,
      password: params.passwordOrPin.trim(),
      pin: params.passwordOrPin.trim(),
      full_name: fullName,
      bar_name: params.barName.trim(),
      phone: params.phone?.trim() || '',
      city: params.city?.trim() || '',
      role: 'owner' as UserRole,
      business_id: businessId,
    }

    const { data, error } = await supabase
      .from('bar_accounts')
      .insert(newAccount)
      .select()
      .single()

    if (error) {
      console.error('Error insertando en bar_accounts:', error)
      return {
        success: false,
        error: error.message || 'Error al guardar la cuenta en la nube.',
      }
    }

    return {
      success: true,
      account: data as CloudAccount,
    }
  } catch (err: unknown) {
    console.error('Excepción al registrar cuenta en la nube:', err)
    const msg = err instanceof Error ? err.message : 'Error de conexión con el servidor.'
    return {
      success: false,
      error: msg,
    }
  }
}

// 3. Autenticar credenciales en la nube (Dueño por email/password o Empleado por PIN)
export async function loginCloudAccount(
  identifier: string,
  pinOrPass: string
): Promise<{ success: boolean; user?: AuthUser; businessId?: string; error?: string }> {
  try {
    const cleanId = identifier.trim()
    const cleanPass = pinOrPass.trim()

    // A. Buscar primero en cuentas comerciales (dueños)
    const { data: accounts, error: accError } = await supabase
      .from('bar_accounts')
      .select('*')
      .or(`email.ilike.${cleanId},full_name.ilike.%${cleanId}%,pin.eq.${cleanPass}`)
      .limit(5)

    if (!accError && accounts && accounts.length > 0) {
      const match = accounts.find(
        (a) =>
          (a.email.toLowerCase() === cleanId.toLowerCase() && (a.password === cleanPass || a.pin === cleanPass)) ||
          (a.pin === cleanPass && cleanId.length === 0) ||
          (a.pin === cleanPass && a.email.toLowerCase() === cleanId.toLowerCase())
      ) || accounts[0]

      if (match && (match.password === cleanPass || match.pin === cleanPass || cleanPass === '')) {
        const initials = match.full_name
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()

        const authUser: AuthUser = {
          id: match.id,
          name: match.full_name,
          email: match.email,
          role: 'owner',
          roleTitle: `Propietario (${match.bar_name})`,
          avatar: initials || 'PR',
          pin: match.pin,
          barName: match.bar_name,
          phone: match.phone,
          city: match.city,
          businessId: match.business_id,
        }

        return {
          success: true,
          user: authUser,
          businessId: match.business_id,
        }
      }
    }

    // B. Buscar en miembros del equipo (meseros o administradores)
    const { data: members, error: memError } = await supabase
      .from('bar_team_members')
      .select('*, bar_accounts(bar_name)')
      .or(`pin.eq.${cleanPass},name.ilike.%${cleanId}%`)
      .limit(5)

    if (!memError && members && members.length > 0) {
      const memberMatch = members.find(
        (m) => m.pin === cleanPass || (cleanId && m.name.toLowerCase().includes(cleanId.toLowerCase()))
      ) || members[0]

      if (memberMatch && (memberMatch.pin === cleanPass || cleanPass === '')) {
        const barName = memberMatch.bar_accounts?.bar_name || 'MI BAR'
        const authUser: AuthUser = {
          id: memberMatch.id,
          name: memberMatch.name,
          email: memberMatch.email || `${memberMatch.name.toLowerCase().replace(/\s+/g, '')}@bar.com`,
          role: memberMatch.role as UserRole,
          roleTitle: memberMatch.role_title || (memberMatch.role === 'admin' ? 'Administrador / Gerente' : 'Mesero / Staff'),
          avatar: memberMatch.avatar || memberMatch.name.slice(0, 2).toUpperCase(),
          pin: memberMatch.pin,
          barName: barName,
          businessId: memberMatch.business_id,
        }

        return {
          success: true,
          user: authUser,
          businessId: memberMatch.business_id,
        }
      }
    }

    return {
      success: false,
      error: 'Credenciales inválidas. Verifica tu correo, usuario o PIN.',
    }
  } catch (err: unknown) {
    console.warn('Error en loginCloudAccount:', err)
    return {
      success: false,
      error: 'No se pudo conectar con el servidor en la nube.',
    }
  }
}

// 4. Obtener miembros del equipo del bar desde la nube
export async function getCloudTeamMembers(businessId: string): Promise<CloudTeamMember[]> {
  if (!businessId) return []
  try {
    const { data, error } = await supabase
      .from('bar_team_members')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('Error cargando miembros de Supabase:', error.message)
      return []
    }
    return (data || []) as CloudTeamMember[]
  } catch (err) {
    console.warn('Error de conexión cargando miembros:', err)
    return []
  }
}

// 5. Guardar o actualizar un miembro del personal en la nube
export async function saveCloudTeamMember(member: CloudTeamMember): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bar_team_members')
      .upsert(member, { onConflict: 'id' })

    if (error) {
      console.warn('Error guardando miembro en Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Error de conexión guardando miembro:', err)
    return false
  }
}

// 6. Eliminar un miembro del personal en la nube
export async function deleteCloudTeamMember(memberId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bar_team_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      console.warn('Error eliminando miembro de Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Error de conexión eliminando miembro:', err)
    return false
  }
}

// 7. Cargar el estado operativo del bar (mesas, productos, caja) desde la nube
export async function getCloudBarData(businessId: string): Promise<BarData | null> {
  if (!businessId) return null
  try {
    const { data, error } = await supabase
      .from('bar_data')
      .select('data')
      .eq('business_id', businessId)
      .maybeSingle()

    if (error) {
      console.warn('Error al leer bar_data en Supabase:', error.message)
      return null
    }
    return (data?.data as BarData) || null
  } catch (err) {
    console.warn('Error de conexión con bar_data:', err)
    return null
  }
}

// 8. Guardar el estado operativo del bar en la nube
export async function saveCloudBarData(businessId: string, barData: BarData): Promise<boolean> {
  if (!businessId) return false
  try {
    const { error } = await supabase.from('bar_data').upsert(
      {
        business_id: businessId,
        data: barData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    )

    if (error) {
      console.warn('Error al sincronizar bar_data en Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Error de conexión guardando bar_data:', err)
    return false
  }
}
