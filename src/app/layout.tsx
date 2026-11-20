"use client"

import { useState, useEffect, useCallback } from 'react'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { UserCheck, LogOut, Camera, Cloud, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useAuthStore, logout } from '@/lib/authStore'
import { useBarStore, smartSyncWithCloud, applyCloudBarDataLocally, applyFullCloudSnapshotLocally, exportAllRegisteredAccountsBackup, BarData } from '@/lib/barState'
import { supabase, isValidUuid, CLOUD_RELAY_MASTER_TOPIC, parseNtfyEventSnapshot, calculateBarDataRichness } from '@/lib/supabaseClient'
import LoginPage from './login/page'
import PhotoUploadModal from '@/components/PhotoUploadModal'
import GlobalDialog from '@/components/GlobalDialog'
import NotificationCenter from '@/components/NotificationCenter'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthStore()
  const barData = useBarStore()
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [showCloudMenu, setShowCloudMenu] = useState(false)
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle')
  const [syncTooltip, setSyncTooltip] = useState<string>('Sincronizado en la nube')
  const [cloudBanner, setCloudBanner] = useState<string>('')
  const isLoginPage = pathname === '/login'
  const isAuthorized = isAuthenticated && !isLoginPage
  const barDisplayName = user?.barName || barData.settings?.barName || 'MI BAR'
  const userPhoto = user?.photoUrl || barData.settings?.logoUrl
  const themePreset = barData.settings?.themePreset || 'rock-red'
  const brandIcon = barData.settings?.brandIcon || '🎸'
  const businessType = barData.settings?.businessType || 'Bar & POS'

  const runCloudSync = useCallback(async (mode: 'auto' | 'push' | 'pull' = 'auto') => {
    if (!isAuthenticated || !user) return
    setCloudStatus('syncing')
    try {
      const res = await smartSyncWithCloud({
        forcePush: mode === 'push',
        forcePull: mode === 'pull',
      })
      if (res.synced) {
        setCloudStatus('synced')
        const timeStr = new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        })
        if (res.action === 'pulled') {
          const msg = `¡Todo tu bar (Mesas, Caja, Productos, Kardex, Usuarios y Perfil) se descargó en este PC! (${timeStr})`
          setSyncTooltip(msg)
          if (mode === 'pull') {
            setCloudBanner(msg)
            setTimeout(() => setCloudBanner(''), 5000)
          }
        } else if (res.action === 'pushed') {
          const msg = `¡Todo tu bar (Mesas, Caja, Productos, Kardex, Usuarios y Perfil) se subió a la Nube! (${timeStr})`
          setSyncTooltip(msg)
          if (mode === 'push') {
            setCloudBanner(msg)
            setTimeout(() => setCloudBanner(''), 5000)
          }
        } else {
          setSyncTooltip(`100% sincronizado entre Portátil y PC (${timeStr})`)
        }
      } else {
        setCloudStatus('offline')
        if (mode !== 'auto') {
          setCloudBanner('No se encontraron datos en la nube aún. Primero presiona "Subir TODO" en tu Portátil.')
          setTimeout(() => setCloudBanner(''), 5000)
        }
      }
    } catch {
      setCloudStatus('offline')
    }
  }, [isAuthenticated, user])

  // Sincronizar estado operativo del bar al iniciar sesión, al volver a la pestaña y periódicamente
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const initTimer = setTimeout(() => {
      runCloudSync('auto')
    }, 50)

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        runCloudSync('auto')
      }
    }

    window.addEventListener('focus', handleVisibilityOrFocus)
    document.addEventListener('visibilitychange', handleVisibilityOrFocus)

    // Polling ligero cada 60 segundos para mantener Portátil y PC de Mesa sincronizados sin saturar ntfy.sh (evita HTTP 429)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        runCloudSync('auto')
      }
    }, 60000)

    return () => {
      clearTimeout(initTimer)
      window.removeEventListener('focus', handleVisibilityOrFocus)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      clearInterval(pollInterval)
    }
  }, [isAuthenticated, user?.id, user?.businessId, runCloudSync, user])

  // Suscripción en tiempo real a cambios de todo el bar (Cloud Relay SSE siempre activo + Supabase Realtime)
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return

    let es: EventSource | null = null
    try {
      es = new EventSource(`https://ntfy.sh/${CLOUD_RELAY_MASTER_TOPIC}/sse`)
      es.onmessage = async (event) => {
        try {
          const parsedEvt = JSON.parse(event.data)
          if (parsedEvt && parsedEvt.event === 'message') {
            const incomingSnap = await parseNtfyEventSnapshot(parsedEvt)
            if (incomingSnap && incomingSnap.barData) {
              const localProdCount = barData.products?.length || 0
              const incomingProdCount = incomingSnap.barData.products?.length || 0
              const localSalesCount = barData.closedSales?.length || 0
              const incomingSalesCount = incomingSnap.barData.closedSales?.length || 0
              const incomingHasPlaceholders = (incomingSnap.barData.products || []).some((p) =>
                String(p.id || '').startsWith('yisus-prod-')
              )
              // Protección crítica: nunca permitir que un evento SSE con 0 productos o 0 ventas borre un estado local con ventas/productos reales
              if (
                (localProdCount > 0 && incomingProdCount === 0) ||
                (localSalesCount > 0 && incomingSalesCount === 0) ||
                (localSalesCount > 0 && incomingHasPlaceholders)
              ) {
                return
              }

              const localScore = calculateBarDataRichness(barData)
              const incomingScore = calculateBarDataRichness(incomingSnap.barData)
              const localTime = barData.updatedAt ? new Date(barData.updatedAt).getTime() : 0
              const incomingTime = incomingSnap.updatedAt
                ? new Date(incomingSnap.updatedAt).getTime()
                : 0

              if (
                incomingProdCount > 0 &&
                ((incomingScore > 20 && localScore <= 20) ||
                  localProdCount === 0 ||
                  incomingTime > localTime + 1000)
              ) {
                applyFullCloudSnapshotLocally(incomingSnap, true)
                setCloudStatus('synced')
                setSyncTooltip('¡Actualizado en vivo desde tu otro computador!')
              }
            }
          }
        } catch {
          // Ignorar evento SSE no válido
        }
      }
    } catch {
      // Ignorar si EventSource no está disponible
    }

    const bizId = user?.businessId
    const channel =
      bizId && isValidUuid(bizId)
        ? supabase
            .channel(`bar_data_realtime_${bizId}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'bar_data',
                filter: `business_id=eq.${bizId}`,
              },
              (payload) => {
                const newRecord = payload.new as { data?: BarData } | undefined
                if (newRecord?.data) {
                  applyCloudBarDataLocally(newRecord.data)
                  setCloudStatus('synced')
                  setSyncTooltip('Actualizado en tiempo real desde otro dispositivo')
                }
              }
            )
            .subscribe()
        : null

    return () => {
      if (es) es.close()
      if (channel) supabase.removeChannel(channel)
    }
  }, [isAuthenticated, user?.businessId, barData])

  const roleKey = (user?.role && ['owner', 'admin', 'staff'].includes(user.role)) ? user.role : 'owner'
  const roleStyles = {
    owner: {
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      tag: '👑 PROPIETARIO',
      gradient: 'from-amber-600 to-red-600',
    },
    admin: {
      badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      tag: '🛡️ ADMIN',
      gradient: 'from-cyan-600 to-blue-600',
    },
    staff: {
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      tag: '🍸 STAFF',
      gradient: 'from-emerald-600 to-teal-600',
    },
  }[roleKey]

  // Si no está autenticado, mostrar el portal de acceso / registro directamente
  if (!isAuthenticated) {
    return (
      <html lang="es" className="dark">
        <body className="bg-[#0a0f18] text-zinc-100 min-h-screen antialiased selection:bg-red-600 selection:text-white flex items-center justify-center">
          <main className="w-full flex items-center justify-center">
            <LoginPage />
          </main>
          <GlobalDialog />
        </body>
      </html>
    )
  }

  return (
    <html lang="es" className="dark" data-theme={themePreset}>
      <body className="text-zinc-100 min-h-screen antialiased selection:bg-red-600 selection:text-white">
        <div className="flex min-h-screen">
          {/* Sidebar Escritorio (no se muestra en login) */}
          {isAuthorized && <Sidebar />}

          {/* Contenido Principal */}
          <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
            {/* Header Superior */}
            {isAuthorized && (
              <header className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center space-x-3">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent font-black text-xl tracking-wider">
                      {brandIcon} {barDisplayName} POS
                    </span>
                  </Link>
                  <span className="hidden sm:inline-block text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full font-medium border border-zinc-700">
                    {businessType} • Turno Activo
                  </span>
                </div>

                <div className="flex items-center space-x-2.5 sm:space-x-3.5">
                  {/* Menú de Sincronización Multi-Dispositivo en la Nube (Portátil <-> PC de Mesa) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCloudMenu((prev) => !prev)}
                      title={`${syncTooltip}. Clic para opciones de sincronización Portátil <-> PC.`}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        cloudStatus === 'syncing'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                          : cloudStatus === 'offline'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      {cloudStatus === 'syncing' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          <span className="hidden sm:inline">Sincronizando...</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">Nube Activa</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </>
                      )}
                    </button>

                    {showCloudMenu && (
                      <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-4 z-50 space-y-3">
                        <div className="pb-2.5 border-b border-zinc-800">
                          <p className="text-xs font-black text-white flex items-center space-x-1.5">
                            <Cloud className="w-4 h-4 text-emerald-400" />
                            <span>Sincronización Total Portátil ↔ PC</span>
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                            Sincroniza <strong className="text-zinc-200">TODO tu bar</strong>: Mesas, Comandas, Caja, Turnos, Productos, Nevera/Bodega, Kardex, Reportes, Descuentos, Usuarios y Foto de Perfil.
                          </p>
                          <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                            {syncTooltip}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            runCloudSync('push')
                            setShowCloudMenu(false)
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          🔼 Subir TODO de este equipo a la Nube
                          <span className="block text-[10px] text-zinc-300 font-normal mt-0.5">
                            Haz clic aquí en tu <strong>Portátil</strong> para enviar todas tus mesas, caja, productos, kardex, usuarios y perfil
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            runCloudSync('pull')
                            setShowCloudMenu(false)
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          🔽 Traer TODO de la Nube a este PC
                          <span className="block text-[10px] text-zinc-300 font-normal mt-0.5">
                            Haz clic aquí en tu <strong>PC de Mesa</strong> para recibir todo tu bar completo al instante
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await exportAllRegisteredAccountsBackup('Copia de Seguridad Pre-Cambio Manual')
                            setCloudBanner('🛡️ Copia de seguridad de todas las cuentas descargada (.JSON) y guardada en Bóveda.')
                            setTimeout(() => setCloudBanner(''), 5000)
                            setShowCloudMenu(false)
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span className="flex items-center space-x-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>🛡️ Copia de Seguridad (Todas las Cuentas)</span>
                          </span>
                          <span className="block text-[10px] text-zinc-300 font-normal mt-0.5">
                            Ejecuta primero este respaldo antes de hacer cambios: descarga el .JSON maestro y crea un punto de restauración
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Centro de Notificaciones & Alertas de Nevera/Inventario */}
                  <NotificationCenter />

                  <div className="flex items-center space-x-2.5 pl-3 border-l border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowPhotoModal(true)}
                      title="Clic para subir o ver la foto del bar / perfil"
                      className="relative group cursor-pointer focus:outline-none"
                    >
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={user?.name || 'Foto del Bar'}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-amber-500/40 shadow-md shadow-amber-950/40 group-hover:scale-105 group-hover:border-amber-400 transition-all"
                        />
                      ) : (
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr ${roleStyles.gradient} flex items-center justify-center font-bold text-white text-xs shadow-md shadow-red-900/30 group-hover:scale-105 transition-transform`}>
                          {user?.avatar || 'PR'}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-zinc-950 border border-zinc-700 group-hover:border-amber-400 rounded-full flex items-center justify-center text-[9px] text-zinc-400 group-hover:text-amber-400 shadow transition-colors">
                        <Camera className="w-2.5 h-2.5" />
                      </span>
                    </button>

                    <Link
                      href="/login"
                      title="Clic para cambiar de rol o usuario"
                      className="hidden sm:block text-left hover:opacity-85 transition-opacity group cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5">
                        <p className="text-xs font-bold text-zinc-200">{user?.name || 'Propietario'}</p>
                        <UserCheck className="w-3 h-3 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${roleStyles.badge}`}>
                        {roleStyles.tag}
                      </span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => logout()}
                    title="Cerrar Sesión"
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </header>
            )}

            {/* Banner de confirmación de sincronización Cloud */}
            {cloudBanner && (
              <div className="mx-4 sm:mx-8 mt-3 px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg animate-fadeIn">
                <span>☁️ {cloudBanner}</span>
                <button
                  type="button"
                  onClick={() => setCloudBanner('')}
                  className="text-emerald-400 hover:text-white ml-3 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Vista principal con padding */}
            <main className={`flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto ${isLoginPage ? 'flex items-center justify-center' : ''}`}>
              {children}
            </main>
          </div>
        </div>

        {/* Modal para subir y gestionar la foto del bar / perfil */}
        <PhotoUploadModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
        />

        {/* Diálogo Modal Global de Confirmación, Avisos y Entradas (Reemplazo moderno de confirm/alert/prompt) */}
        <GlobalDialog />

        {/* Navegación inferior móvil (no se muestra en login) */}
        {!isLoginPage && <MobileNav />}
      </body>
    </html>
  )
}