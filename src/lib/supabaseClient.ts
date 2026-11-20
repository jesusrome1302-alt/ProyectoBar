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

export interface FullBarCloudSnapshot {
  version: number
  updatedAt: string
  richnessScore: number
  businessId: string
  ownerUser: AuthUser
  barUsers: AuthUser[]
  barData: BarData
  deletedAccounts?: DeletedCloudAccountRecord[]
}

export const CLOUD_RELAY_MASTER_TOPIC = 'rockbar_proyectobar_master_v3'

export function normalizeCloudSlug(value?: string | null): string {
  if (!value) return ''
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 42)
}

export function getRelayTopicsForUser(
  user?: Partial<AuthUser> | null,
  barNameOverride?: string
): string[] {
  const topics = new Set<string>([CLOUD_RELAY_MASTER_TOPIC])
  const roleMatch = typeof user?.roleTitle === 'string' ? user.roleTitle.match(/\(([^)]+)\)/) : null
  const roleBarName = roleMatch && roleMatch[1] ? roleMatch[1] : ''

  for (const candidateBar of [barNameOverride, user?.barName, roleBarName]) {
    const barSlug = normalizeCloudSlug(candidateBar)
    if (barSlug && barSlug !== 'rock_bar' && barSlug !== 'mi_bar') {
      topics.add(`rockbar_v3_bar_${barSlug}`)
    }
  }

  const emailSlug = normalizeCloudSlug(user?.email)
  if (emailSlug && !emailSlug.endsWith('rockbar_com')) {
    topics.add(`rockbar_v3_eml_${emailSlug}`)
    if (emailSlug.includes('jesusrome1302')) {
      topics.add('rockbar_v3_bar_yisus_bar')
      topics.add('rockbar_v3_usr_jesus_arias')
    }
  }
  const nameSlug = normalizeCloudSlug(user?.name)
  if (
    nameSlug &&
    !['carlos_santana', 'andres_calamaro', 'fito_paez', 'propietario'].includes(nameSlug)
  ) {
    topics.add(`rockbar_v3_usr_${nameSlug}`)
    if (nameSlug.includes('jesus_arias')) {
      topics.add('rockbar_v3_bar_yisus_bar')
      topics.add('rockbar_v3_eml_jesusrome1302_gmail_com')
    }
  }
  return Array.from(topics)
}

interface NtfyEventLine {
  id?: string
  time?: number
  event?: string
  topic?: string
  message?: string
  attachment?: {
    name?: string
    url?: string
  }
}

// Parsear un evento individual de ntfy (ya sea texto directo o archivo JSON adjunto)
export async function parseNtfyEventSnapshot(
  evt: NtfyEventLine
): Promise<FullBarCloudSnapshot | null> {
  try {
    if (evt.attachment?.url) {
      const res = await fetch(evt.attachment.url, { cache: 'no-store' })
      if (!res.ok) return null
      const parsed = (await res.json()) as FullBarCloudSnapshot
      if (parsed && parsed.barData && parsed.ownerUser) {
        return parsed
      }
    } else if (evt.message && evt.message.trim().startsWith('{')) {
      const parsed = JSON.parse(evt.message) as FullBarCloudSnapshot
      if (parsed && parsed.barData && parsed.ownerUser) {
        return parsed
      }
    }
  } catch {
    // Ignorar mensaje malformado
  }
  return null
}

// Subir el snapshot COMPLETO del bar (Productos, Mesas, Comandas, Caja, Kardex, Usuarios, Descuentos, Configuración y Foto) al Cloud Relay siempre activo
export async function pushCloudRelaySnapshot(
  snapshot: FullBarCloudSnapshot
): Promise<boolean> {
  try {
    const body = JSON.stringify(snapshot)
    const topics = getRelayTopicsForUser(
      snapshot.ownerUser,
      snapshot.barData?.settings?.barName || snapshot.ownerUser?.barName
    )

    let anyOk = false
    await Promise.all(
      topics.map(async (topic) => {
        try {
          const res = await fetch(`https://ntfy.sh/${topic}`, {
            method: 'PUT',
            headers: {
              Filename: 'bar_full_snapshot.json',
            },
            body,
          })
          if (res.ok) {
            anyOk = true
          }
        } catch {
          // Ignorar error individual de tópico
        }
      })
    )
    return anyOk
  } catch (err) {
    console.warn('Error en pushCloudRelaySnapshot:', err)
    return false
  }
}

// Descargar el snapshot COMPLETO más reciente y rico del bar desde el Cloud Relay siempre activo
export async function pullCloudRelaySnapshot(criteria?: {
  email?: string
  barName?: string
  userName?: string
  businessId?: string
  allowAnyIfEmpty?: boolean
}): Promise<FullBarCloudSnapshot | null> {
  try {
    const topics = getRelayTopicsForUser(
      {
        email: criteria?.email,
        name: criteria?.userName,
        barName: criteria?.barName,
      },
      criteria?.barName
    )

    const candidates: FullBarCloudSnapshot[] = []

    // Consultar todos los tópicos en UNA SOLA petición HTTP combinada (ntfy soporta tópicos separados por coma)
    // Esto evita el error HTTP 429 (Too Many Requests) de ntfy.sh
    const combinedTopics = topics.join(',')
    try {
      const res = await fetch(`https://ntfy.sh/${combinedTopics}/json?poll=1&since=all`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const raw = await res.text()
        if (raw && raw.trim()) {
          const lines = raw
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0)

          const messageEvents: NtfyEventLine[] = []
          for (const line of lines) {
            try {
              const evt = JSON.parse(line) as NtfyEventLine
              if (evt && evt.event === 'message') {
                messageEvents.push(evt)
              }
            } catch {
              // Ignorar línea inválida
            }
          }

          // Deduplicar adjuntos por tamaño/tiempo y revisar del más reciente hacia atrás sin detenerse en snapshots vacíos o placeholders
          const recentEvents = messageEvents.slice(-25).reverse()
          const seenSizes = new Set<string>()
          for (const evt of recentEvents) {
            const sig = `${evt.time || 0}_${(evt.attachment as { size?: number } | undefined)?.size || (evt.message?.length || 0)}`
            if (seenSizes.has(sig)) continue
            seenSizes.add(sig)

            const snap = await parseNtfyEventSnapshot(evt)
            if (snap && snap.barData) {
              candidates.push(snap)
            }
          }
        }
      }
    } catch {
      // Ignorar fallo de red
    }

    if (candidates.length === 0) return null

    const cleanEmail = normalizeCloudSlug(criteria?.email)
    const cleanBar = normalizeCloudSlug(criteria?.barName)
    const cleanUser = normalizeCloudSlug(criteria?.userName)

    // Filtrar candidatos que coincidan con el usuario/bar actual (o permitir cualquiera si el PC de Mesa está en blanco)
    const matchingCandidates = candidates.filter((snap) => {
      const snapEmail = normalizeCloudSlug(snap.ownerUser?.email)
      const snapBar = normalizeCloudSlug(
        snap.barData?.settings?.barName || snap.ownerUser?.barName
      )
      const snapUser = normalizeCloudSlug(snap.ownerUser?.name || snap.barData?.operatorName)

      if (criteria?.businessId && snap.businessId === criteria.businessId) return true
      if (cleanEmail && !cleanEmail.endsWith('rockbar_com') && snapEmail === cleanEmail) return true
      if (
        cleanBar &&
        cleanBar !== 'rock_bar' &&
        cleanBar !== 'mi_bar' &&
        snapBar &&
        (snapBar === cleanBar || snapBar.includes(cleanBar) || cleanBar.includes(snapBar))
      ) {
        return true
      }
      if (
        cleanUser &&
        !['carlos_santana', 'andres_calamaro', 'fito_paez', 'propietario'].includes(cleanUser) &&
        snapUser &&
        (snapUser === cleanUser || snapUser.includes(cleanUser) || cleanUser.includes(snapUser))
      ) {
        return true
      }
      return Boolean(criteria?.allowAnyIfEmpty)
    })

    const pool = matchingCandidates.length > 0 ? matchingCandidates : candidates

    // Ordenar priorizando SIEMPRE el snapshot que tenga ventas reales (closedSales), movimientos y productos reales
    pool.sort((a, b) => {
      const scoreA = calculateBarDataRichness(a.barData)
      const scoreB = calculateBarDataRichness(b.barData)
      const aHasRealSales = (a.barData?.closedSales?.length || 0) > 0 ? 1 : 0
      const bHasRealSales = (b.barData?.closedSales?.length || 0) > 0 ? 1 : 0
      if (aHasRealSales !== bHasRealSales) return bHasRealSales - aHasRealSales

      const prodA = a.barData?.products?.length || 0
      const prodB = b.barData?.products?.length || 0
      const aHasProducts = prodA > 0 ? 1 : 0
      const bHasProducts = prodB > 0 ? 1 : 0
      if (aHasProducts !== bHasProducts) return bHasProducts - aHasProducts

      const aHasData = scoreA > 20 ? 1 : 0
      const bHasData = scoreB > 20 ? 1 : 0
      if (aHasData !== bHasData) return bHasData - aHasData

      if (Math.abs(scoreB - scoreA) > 300) return scoreB - scoreA

      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return timeB - timeA
    })

    return pool[0] || null
  } catch (err) {
    console.warn('Error en pullCloudRelaySnapshot:', err)
    return null
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUuid(value?: string | null): boolean {
  return Boolean(value && UUID_REGEX.test(value.trim()))
}

export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Calcular un puntaje de riqueza de datos para saber cuál estado (local o nube) contiene la información real del bar
export function calculateBarDataRichness(data?: BarData | null): number {
  if (!data) return 0
  const rawProducts = data.products || []
  // Ignorar productos placeholder antiguos (yisus-prod-*) para que nunca le ganen a los productos y ventas reales del 18 y 19
  const hasPlaceholderProducts = rawProducts.some((p) => String(p.id || '').startsWith('yisus-prod-'))
  if (hasPlaceholderProducts && (data.closedSales?.length || 0) === 0) {
    return 18
  }

  const productsCount = rawProducts.length
  const totalStock = rawProducts.reduce((acc, p) => acc + (p.stock || 0), 0)
  const kardexCount = data.inventoryMovements?.length || 0
  const closedSalesCount = data.closedSales?.length || 0
  const movementsCount = data.movements?.length || 0
  const sessionsCount = data.sessions?.length || 0
  const salesCount = closedSalesCount + movementsCount
  const occupiedTables = (data.tables || []).filter(
    (t) => (t.items?.length || 0) > 0 || t.status !== 'available'
  ).length
  const hasLogo = Boolean(data.settings?.logoUrl && data.settings.logoUrl.length > 10)
  const hasCustomBarName = Boolean(
    data.settings?.barName &&
      data.settings.barName.trim().toUpperCase() !== 'ROCK BAR' &&
      data.settings.barName.trim().toUpperCase() !== 'MI BAR'
  )
  const customCategories = (data.categories || []).filter((c) => !c.isDefault).length
  const customDiscounts = (data.discounts || []).filter((d) => !d.isPreset).length
  const suppliersAndPurchases = (data.suppliers?.length || 0) + (data.purchases?.length || 0)

  // Si no tiene productos ni nombre personalizado ni logo ni ventas, nunca debe superar 15 puntos aunque tenga 1 mesa abierta sin productos
  if (
    productsCount === 0 &&
    !hasCustomBarName &&
    !hasLogo &&
    salesCount === 0 &&
    customCategories === 0 &&
    customDiscounts === 0
  ) {
    return Math.min(15, occupiedTables * 5)
  }

  return (
    productsCount * 500 +
    closedSalesCount * 400 +
    movementsCount * 120 +
    sessionsCount * 300 +
    totalStock +
    kardexCount * 80 +
    occupiedTables * 80 +
    (hasLogo ? 250 : 0) +
    (hasCustomBarName ? 80 : 0) +
    (customCategories + customDiscounts + suppliersAndPurchases) * 40
  )
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

// 2. Registrar un nuevo Bar y su Propietario en la nube (o recuperar cuenta existente si ya estaba)
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
    const businessId = generateUuidV4()

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

// 2.B Resolver o auto-registrar la cuenta del usuario activo en Supabase (unificando Portátil y PC de Mesa)
export async function resolveOrEnsureCloudAccount(params: {
  user: AuthUser
  currentBarData?: BarData | null
}): Promise<{
  account: CloudAccount | null
  cloudBarData: BarData | null
  cloudUpdatedAt?: string
  allMatchedBusinessIds: string[]
}> {
  const { user, currentBarData } = params
  try {
    const cleanEmail = (user.email || '').trim().toLowerCase()
    const cleanName = (user.name || '').trim().toLowerCase()
    const cleanBarName = (
      user.barName ||
      currentBarData?.settings?.barName ||
      ''
    )
      .trim()
      .toLowerCase()
    const cleanBizId = isValidUuid(user.businessId) ? user.businessId!.trim() : ''

    // Consultar todas las cuentas en bar_accounts para encontrar coincidencias por email, business_id, nombre o nombre del bar
    const { data: allAccounts, error: accErr } = await supabase
      .from('bar_accounts')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200)

    const matchedAccounts: CloudAccount[] = []
    if (!accErr && Array.isArray(allAccounts)) {
      for (const acc of allAccounts as CloudAccount[]) {
        const accEmail = (acc.email || '').trim().toLowerCase()
        const accName = (acc.full_name || '').trim().toLowerCase()
        const accBar = (acc.bar_name || '').trim().toLowerCase()

        const matchesBizId = Boolean(cleanBizId && acc.business_id === cleanBizId)
        const matchesEmail = Boolean(
          cleanEmail &&
            !cleanEmail.endsWith('@rockbar.com') &&
            accEmail === cleanEmail
        )
        const matchesBarName = Boolean(
          cleanBarName &&
            cleanBarName !== 'rock bar' &&
            cleanBarName !== 'mi bar' &&
            (accBar === cleanBarName ||
              accBar.includes(cleanBarName) ||
              cleanBarName.includes(accBar))
        )
        const matchesFullName = Boolean(
          cleanName &&
            !['carlos santana', 'andrés calamaro', 'fito páez', 'propietario'].includes(cleanName) &&
            (accName === cleanName ||
              accName.includes(cleanName) ||
              cleanName.includes(accName))
        )

        if (matchesBizId || matchesEmail || matchesBarName || matchesFullName) {
          matchedAccounts.push(acc)
        }
      }
    }

    // Consultar también bar_data por si el nombre del bar o del operador se actualizó dentro del JSONB data
    const { data: allBarDataRows } = await supabase
      .from('bar_data')
      .select('business_id, data, updated_at')
      .limit(100)

    const dataByBizId = new Map<
      string,
      { data: BarData; updated_at?: string; score: number }
    >()

    if (Array.isArray(allBarDataRows)) {
      for (const row of allBarDataRows) {
        if (row && row.business_id && row.data) {
          const d = row.data as BarData
          dataByBizId.set(row.business_id, {
            data: d,
            updated_at: row.updated_at,
            score: calculateBarDataRichness(d),
          })

          // Si este bar_data coincide con el nombre del bar o el operador del usuario y su cuenta aún no estaba en matchedAccounts, incluirla
          const dBar = (d.settings?.barName || '').trim().toLowerCase()
          const dOp = (d.operatorName || '').trim().toLowerCase()
          const matchesDataBar = Boolean(
            cleanBarName &&
              cleanBarName !== 'rock bar' &&
              cleanBarName !== 'mi bar' &&
              dBar &&
              (dBar === cleanBarName || dBar.includes(cleanBarName) || cleanBarName.includes(dBar))
          )
          const matchesDataOp = Boolean(
            cleanName &&
              !['carlos santana', 'andrés calamaro', 'fito páez', 'propietario', 'administrador'].includes(cleanName) &&
              dOp &&
              (dOp === cleanName || dOp.includes(cleanName) || cleanName.includes(dOp))
          )

          if ((matchesDataBar || matchesDataOp) && Array.isArray(allAccounts)) {
            const linkedAcc = (allAccounts as CloudAccount[]).find(
              (a) => a.business_id === row.business_id
            )
            if (linkedAcc && !matchedAccounts.some((m) => m.business_id === linkedAcc.business_id)) {
              matchedAccounts.push(linkedAcc)
            }
          }
        }
      }
    }

    // Si encontramos 1 o más cuentas para este mismo usuario/bar, elegimos la que tenga más información en bar_data
    if (matchedAccounts.length > 0) {
      const candidateBizIds = Array.from(
        new Set(matchedAccounts.map((a) => a.business_id).filter(Boolean))
      )

      // Ordenar cuentas candidatas priorizando la que tenga mayor riqueza de datos en bar_data
      const sortedAccounts = [...matchedAccounts].sort((a, b) => {
        const infoA = dataByBizId.get(a.business_id)
        const infoB = dataByBizId.get(b.business_id)
        const scoreA = infoA?.score ?? -1
        const scoreB = infoB?.score ?? -1
        if (scoreA !== scoreB) return scoreB - scoreA

        const timeA = infoA?.updated_at ? new Date(infoA.updated_at).getTime() : 0
        const timeB = infoB?.updated_at ? new Date(infoB.updated_at).getTime() : 0
        return timeB - timeA
      })

      const bestAccount = sortedAccounts[0]
      const bestDataEntry = dataByBizId.get(bestAccount.business_id)

      return {
        account: bestAccount,
        cloudBarData: bestDataEntry?.data || null,
        cloudUpdatedAt: bestDataEntry?.updated_at,
        allMatchedBusinessIds: candidateBizIds,
      }
    }

    // Si la cuenta aún NO existe en public.bar_accounts en Supabase (ej. fue creada localmente en el portátil),
    // la registramos automáticamente en la nube para que el PC de Mesa pueda encontrarla y sincronizar
    const isDemoPreset = ['user-owner-1', 'user-admin-1', 'user-staff-1'].includes(user.id)
    const hasCustomBarOrProducts =
      !isDemoPreset ||
      calculateBarDataRichness(currentBarData) > 0 ||
      Boolean(cleanBarName && cleanBarName !== 'rock bar')

    if (hasCustomBarOrProducts) {
      const targetBizId = cleanBizId || generateUuidV4()
      const safeEmail =
        cleanEmail && cleanEmail.includes('@')
          ? cleanEmail
          : `${(cleanName || 'usuario').replace(/\s+/g, '.')}.${targetBizId.slice(0, 4)}@bar.com`

      const newAccountPayload = {
        email: safeEmail,
        password: (user.pin || '1111').trim(),
        pin: (user.pin || '1111').trim(),
        full_name: (user.name || 'Propietario').trim(),
        bar_name: (user.barName || currentBarData?.settings?.barName || 'MI BAR').trim(),
        phone: (user.phone || currentBarData?.settings?.phone || '').trim(),
        city: (user.city || '').trim(),
        role: (user.role || 'owner') as UserRole,
        business_id: targetBizId,
      }

      const { data: createdAcc, error: createErr } = await supabase
        .from('bar_accounts')
        .upsert(newAccountPayload, { onConflict: 'email' })
        .select()
        .single()

      if (!createErr && createdAcc) {
        const acc = createdAcc as CloudAccount
        const existingCloudData = await getCloudBarData(acc.business_id)
        return {
          account: acc,
          cloudBarData: existingCloudData,
          allMatchedBusinessIds: [acc.business_id],
        }
      }
    }
  } catch (err) {
    console.warn('Error en resolveOrEnsureCloudAccount:', err)
  }

  return {
    account: null,
    cloudBarData: null,
    allMatchedBusinessIds: isValidUuid(user.businessId) ? [user.businessId!] : [],
  }
}

// 3. Autenticar credenciales en la nube (Dueño por email/nombre/bar + password/PIN, o Empleado por PIN)
export async function loginCloudAccount(
  identifier: string,
  pinOrPass: string
): Promise<{
  success: boolean
  user?: AuthUser
  businessId?: string
  barData?: BarData | null
  snapshot?: FullBarCloudSnapshot | null
  error?: string
}> {
  const cleanId = identifier.trim().toLowerCase()
  const cleanPass = pinOrPass.trim()

  // PASO 1: Consultar primero el Cloud Relay siempre activo (funciona incluso si el proyecto gratuito de Supabase está en pausa)
  try {
    const relaySnap = await pullCloudRelaySnapshot({
      email: cleanId.includes('@') ? cleanId : undefined,
      barName: !cleanId.includes('@') ? cleanId : undefined,
      userName: !cleanId.includes('@') ? cleanId : undefined,
      allowAnyIfEmpty: true,
    })

    if (relaySnap && relaySnap.ownerUser) {
      const allSnapUsers: AuthUser[] = [
        relaySnap.ownerUser,
        ...(Array.isArray(relaySnap.barUsers) ? relaySnap.barUsers : []),
      ]
      const uniqueUsersMap = new Map<string, AuthUser>()
      for (const u of allSnapUsers) {
        if (u && u.id) uniqueUsersMap.set(u.id, u)
      }
      const snapUsers = Array.from(uniqueUsersMap.values())

      const matchedSnapUser = snapUsers.find((u) => {
        const uEmail = (u.email || '').trim().toLowerCase()
        const uName = (u.name || '').trim().toLowerCase()
        const uBar = (
          u.barName ||
          relaySnap.barData?.settings?.barName ||
          relaySnap.ownerUser?.barName ||
          ''
        )
          .trim()
          .toLowerCase()
        const uPin = (u.pin || '').trim()

        const idMatches =
          cleanId.length === 0 ||
          uEmail === cleanId ||
          uName.includes(cleanId) ||
          cleanId.includes(uName) ||
          (uBar.length > 0 && (uBar.includes(cleanId) || cleanId.includes(uBar)))

        const passMatches = cleanPass.length === 0 || uPin === cleanPass

        if (cleanId.length > 0 && cleanPass.length > 0) return idMatches && passMatches
        if (cleanId.length === 0 && cleanPass.length > 0) return passMatches
        if (cleanId.length > 0 && cleanPass.length === 0) return idMatches
        return false
      })

      if (matchedSnapUser) {
        const effectiveBarName =
          relaySnap.barData?.settings?.barName ||
          matchedSnapUser.barName ||
          relaySnap.ownerUser.barName ||
          'MI BAR'
        const effectivePhoto =
          relaySnap.barData?.settings?.logoUrl ||
          matchedSnapUser.photoUrl ||
          relaySnap.ownerUser.photoUrl

        const enrichedUser: AuthUser = {
          ...matchedSnapUser,
          barName: effectiveBarName,
          photoUrl: effectivePhoto,
          businessId: relaySnap.businessId || matchedSnapUser.businessId,
        }

        return {
          success: true,
          user: enrichedUser,
          businessId: enrichedUser.businessId,
          barData: relaySnap.barData,
          snapshot: {
            ...relaySnap,
            ownerUser:
              enrichedUser.role === 'owner' ? enrichedUser : relaySnap.ownerUser,
          },
        }
      }
    }
  } catch (relayErr) {
    console.warn('Aviso al consultar Cloud Relay en login:', relayErr)
  }

  // PASO 2: Consultar Supabase (si el proyecto está activo)
  try {
    // A. Consultar cuentas comerciales en public.bar_accounts y filtrar en memoria (evita errores de espacios en PostgREST .or)
    const { data: allAccounts, error: accError } = await supabase
      .from('bar_accounts')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200)

    if (!accError && Array.isArray(allAccounts) && allAccounts.length > 0) {
      const candidateAccounts = (allAccounts as CloudAccount[]).filter((a) => {
        const emailMatch = cleanId.length > 0 && (a.email || '').trim().toLowerCase() === cleanId
        const nameMatch =
          cleanId.length > 0 && (a.full_name || '').trim().toLowerCase().includes(cleanId)
        const barMatch =
          cleanId.length > 0 && (a.bar_name || '').trim().toLowerCase().includes(cleanId)
        const passMatch =
          cleanPass.length > 0 && (a.password === cleanPass || a.pin === cleanPass)

        if (cleanId.length > 0 && cleanPass.length > 0) {
          // Debe coincidir el identificador (correo, nombre del dueño o nombre del bar) Y la contraseña/PIN
          return (emailMatch || nameMatch || barMatch) && passMatch
        }
        if (cleanId.length === 0 && cleanPass.length > 0) {
          // Solo ingresó PIN
          return passMatch
        }
        if (cleanId.length > 0 && cleanPass.length === 0) {
          // Solo ingresó correo exacto
          return emailMatch
        }
        return false
      })

      // Si no hubo coincidencia con contraseña exacta pero el usuario ingresó correo/nombre/bar, verificar si existe la cuenta para dar mensaje claro o si hay otra cuenta del mismo dueño
      if (candidateAccounts.length > 0) {
        // Si hay varias cuentas que coinciden (ej. creadas en diferentes sesiones), elegir la que tenga más datos en bar_data
        const bizIds = Array.from(new Set(candidateAccounts.map((a) => a.business_id).filter(Boolean)))
        const { data: barDataRows } = await supabase
          .from('bar_data')
          .select('business_id, data, updated_at')
          .in('business_id', bizIds)

        const dataByBiz = new Map<string, { data: BarData; score: number; updated_at?: string }>()
        if (Array.isArray(barDataRows)) {
          for (const r of barDataRows) {
            if (r?.business_id && r?.data) {
              const d = r.data as BarData
              dataByBiz.set(r.business_id, {
                data: d,
                score: calculateBarDataRichness(d),
                updated_at: r.updated_at,
              })
            }
          }
        }

        const sortedMatches = [...candidateAccounts].sort((a, b) => {
          const scoreA = dataByBiz.get(a.business_id)?.score ?? -1
          const scoreB = dataByBiz.get(b.business_id)?.score ?? -1
          if (scoreA !== scoreB) return scoreB - scoreA
          const timeA = dataByBiz.get(a.business_id)?.updated_at
            ? new Date(dataByBiz.get(a.business_id)!.updated_at!).getTime()
            : 0
          const timeB = dataByBiz.get(b.business_id)?.updated_at
            ? new Date(dataByBiz.get(b.business_id)!.updated_at!).getTime()
            : 0
          return timeB - timeA
        })

        const match = sortedMatches[0]
        const cloudBarData = dataByBiz.get(match.business_id)?.data || null

        const initials = (match.full_name || 'PR')
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()

        const effectiveBarName = cloudBarData?.settings?.barName || match.bar_name
        const effectivePhotoUrl = cloudBarData?.settings?.logoUrl || undefined

        const authUser: AuthUser = {
          id: match.id,
          name: match.full_name,
          email: match.email,
          role: 'owner',
          roleTitle: `Propietario (${effectiveBarName})`,
          avatar: initials || 'PR',
          photoUrl: effectivePhotoUrl,
          pin: match.pin,
          barName: effectiveBarName,
          phone: match.phone,
          city: match.city,
          businessId: match.business_id,
        }

        return {
          success: true,
          user: authUser,
          businessId: match.business_id,
          barData: cloudBarData,
        }
      }
    }

    // B. Buscar en miembros del equipo (meseros o administradores)
    const { data: members, error: memError } = await supabase
      .from('bar_team_members')
      .select('*, bar_accounts(bar_name)')
      .limit(100)

    if (!memError && Array.isArray(members) && members.length > 0) {
      const memberMatch = members.find((m) => {
        const pinOk = cleanPass.length > 0 && m.pin === cleanPass
        const nameOrEmailOk =
          cleanId.length === 0 ||
          (m.name || '').toLowerCase().includes(cleanId) ||
          (m.email || '').toLowerCase() === cleanId
        return pinOk && nameOrEmailOk
      })

      if (memberMatch) {
        const cloudBarData = await getCloudBarData(memberMatch.business_id)
        const barName =
          cloudBarData?.settings?.barName || memberMatch.bar_accounts?.bar_name || 'MI BAR'
        const authUser: AuthUser = {
          id: memberMatch.id,
          name: memberMatch.name,
          email:
            memberMatch.email || `${memberMatch.name.toLowerCase().replace(/\s+/g, '')}@bar.com`,
          role: memberMatch.role as UserRole,
          roleTitle:
            memberMatch.role_title ||
            (memberMatch.role === 'admin' ? 'Administrador / Gerente' : 'Mesero / Staff'),
          avatar: memberMatch.avatar || memberMatch.name.slice(0, 2).toUpperCase(),
          photoUrl: cloudBarData?.settings?.logoUrl || undefined,
          pin: memberMatch.pin,
          barName: barName,
          businessId: memberMatch.business_id,
        }

        return {
          success: true,
          user: authUser,
          businessId: memberMatch.business_id,
          barData: cloudBarData,
        }
      }
    }

    return {
      success: false,
      error: 'Credenciales inválidas. Verifica tu correo, nombre de usuario o PIN.',
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
  if (!businessId || !isValidUuid(businessId)) return null
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

// 8. Guardar el estado operativo del bar en la nube (con auto-reparación de cuenta si falta en bar_accounts)
export async function saveCloudBarData(
  businessId: string,
  barData: BarData,
  mirrorBusinessIds?: string[]
): Promise<boolean> {
  try {
    let targetBizId = isValidUuid(businessId) ? businessId : ''

    // Si el businessId no es un UUID válido, intentar resolver/crear la cuenta en bar_accounts primero
    if (!targetBizId && typeof window !== 'undefined') {
      const authRaw = localStorage.getItem('ROCK_BAR_AUTH_SESSION_V1')
      if (authRaw) {
        const parsedAuth = JSON.parse(authRaw)
        if (parsedAuth?.user) {
          const resolved = await resolveOrEnsureCloudAccount({
            user: parsedAuth.user,
            currentBarData: barData,
          })
          if (resolved.account?.business_id) {
            targetBizId = resolved.account.business_id
            parsedAuth.user.businessId = targetBizId
            localStorage.setItem('ROCK_BAR_AUTH_SESSION_V1', JSON.stringify(parsedAuth))
          }
        }
      }
    }

    if (!targetBizId) return false

    const nowIso = new Date().toISOString()
    const payloadData: BarData = {
      ...barData,
      updatedAt: barData.updatedAt || nowIso,
    }

    // Si cambió el nombre del bar en configuración, mantener actualizado bar_name en bar_accounts
    if (payloadData.settings?.barName && payloadData.settings.barName !== 'ROCK BAR') {
      supabase
        .from('bar_accounts')
        .update({ bar_name: payloadData.settings.barName })
        .eq('business_id', targetBizId)
        .then(() => {})
    }

    const { error } = await supabase.from('bar_data').upsert(
      {
        business_id: targetBizId,
        data: payloadData,
        updated_at: nowIso,
      },
      { onConflict: 'business_id' }
    )

    // Si falló por llave foránea (la fila en bar_accounts no existía aún para ese business_id), auto-reparar y reintentar
    if (error) {
      if (typeof window !== 'undefined') {
        const authRaw = localStorage.getItem('ROCK_BAR_AUTH_SESSION_V1')
        if (authRaw) {
          const parsedAuth = JSON.parse(authRaw)
          if (parsedAuth?.user) {
            const resolved = await resolveOrEnsureCloudAccount({
              user: { ...parsedAuth.user, businessId: targetBizId },
              currentBarData: payloadData,
            })
            if (resolved.account?.business_id) {
              const repairedBizId = resolved.account.business_id
              parsedAuth.user.businessId = repairedBizId
              localStorage.setItem('ROCK_BAR_AUTH_SESSION_V1', JSON.stringify(parsedAuth))
              const retry = await supabase.from('bar_data').upsert(
                {
                  business_id: repairedBizId,
                  data: payloadData,
                  updated_at: nowIso,
                },
                { onConflict: 'business_id' }
              )
              if (!retry.error) return true
            }
          }
        }
      }
      console.warn('Error al sincronizar bar_data en Supabase:', error.message)
      return false
    }

    // Si había cuentas duplicadas del mismo propietario/bar en bar_accounts, espejar los datos para que cualquier dispositivo vea lo mismo
    if (Array.isArray(mirrorBusinessIds) && mirrorBusinessIds.length > 1) {
      const otherIds = mirrorBusinessIds.filter((id) => id !== targetBizId && isValidUuid(id))
      for (const extraId of otherIds) {
        await supabase.from('bar_data').upsert(
          {
            business_id: extraId,
            data: payloadData,
            updated_at: nowIso,
          },
          { onConflict: 'business_id' }
        )
      }
    }

    return true
  } catch (err) {
    console.warn('Error de conexión guardando bar_data:', err)
    return false
  }
}

export interface DeletedCloudAccountRecord {
  id: string
  original_account_id?: string
  business_id: string
  email: string
  full_name: string
  bar_name: string
  phone?: string
  city?: string
  deletion_reason: string
  pin_verified: boolean
  deleted_at: string
}

// 9. Archivar en base de datos de usuarios eliminados (deleted_bar_accounts) y eliminar cuenta activa en Supabase
export async function archiveAndDeleteCloudAccount(params: {
  user: AuthUser
  reason: string
  finalSnapshot?: BarData
}): Promise<{ success: boolean; archivedInCloud: boolean; deletedFromActive: boolean; error?: string }> {
  const businessId = params.user.businessId || `biz-local-${Date.now()}`
  let archivedInCloud = false
  let deletedFromActive = false

  try {
    // A. Insertar registro en la base de datos de cuentas eliminadas (deleted_bar_accounts)
    const { error: archiveError } = await supabase.from('deleted_bar_accounts').insert({
      original_account_id: params.user.id,
      business_id: businessId.startsWith('biz-') ? undefined : businessId,
      email: params.user.email,
      full_name: params.user.name,
      bar_name: params.user.barName || params.finalSnapshot?.settings?.barName || 'MI BAR',
      phone: params.user.phone || params.finalSnapshot?.settings?.phone || '',
      city: params.user.city || '',
      deletion_reason: params.reason || 'Eliminación verificada con PIN por el propietario',
      pin_verified: true,
      final_snapshot: params.finalSnapshot || {},
      deleted_at: new Date().toISOString(),
    })

    if (!archiveError) {
      archivedInCloud = true
    } else {
      console.warn('Aviso al archivar en deleted_bar_accounts:', archiveError.message)
    }

    // B. Eliminar datos operativos, miembros y cuenta comercial activa en Supabase
    if (params.user.businessId && !params.user.businessId.startsWith('biz-')) {
      await supabase.from('bar_data').delete().eq('business_id', params.user.businessId)
      await supabase.from('bar_team_members').delete().eq('business_id', params.user.businessId)
      const { error: delAccErr } = await supabase
        .from('bar_accounts')
        .delete()
        .eq('business_id', params.user.businessId)
      if (!delAccErr) {
        deletedFromActive = true
      }
    } else if (params.user.email) {
      const { error: delByEmailErr } = await supabase
        .from('bar_accounts')
        .delete()
        .ilike('email', params.user.email.trim())
      if (!delByEmailErr) {
        deletedFromActive = true
      }
    }

    return {
      success: true,
      archivedInCloud,
      deletedFromActive,
    }
  } catch (err: unknown) {
    console.warn('Error en archiveAndDeleteCloudAccount:', err)
    return {
      success: true,
      archivedInCloud,
      deletedFromActive,
      error: err instanceof Error ? err.message : 'Procesado localmente',
    }
  }
}

// 10. Consultar base de datos de usuarios / cuentas eliminadas
export async function getDeletedCloudAccounts(): Promise<DeletedCloudAccountRecord[]> {
  try {
    const { data, error } = await supabase
      .from('deleted_bar_accounts')
      .select('id, original_account_id, business_id, email, full_name, bar_name, phone, city, deletion_reason, pin_verified, deleted_at')
      .order('deleted_at', { ascending: false })
      .limit(20)

    if (error || !data) return []
    return data as DeletedCloudAccountRecord[]
  } catch {
    return []
  }
}

