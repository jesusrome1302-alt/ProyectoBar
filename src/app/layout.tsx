"use client"

import { useState, useEffect, useCallback } from 'react'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { UserCheck, LogOut, Camera, Cloud, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useAuthStore, logout } from '@/lib/authStore'
import { useBarStore, smartSyncWithCloud, applyCloudBarDataLocally, BarData } from '@/lib/barState'
import { supabase, isValidUuid } from '@/lib/supabaseClient'
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
        if (res.action === 'pulled') {
          setSyncTooltip('¡Datos descargados desde la nube a este PC!')
        } else if (res.action === 'pushed') {
          setSyncTooltip('¡Datos de este equipo subidos a la nube!')
        } else {
          setSyncTooltip('100% sincronizado entre tus dispositivos')
        }
      } else {
        setCloudStatus(mode !== 'auto' ? 'offline' : 'synced')
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

    // Polling ligero cada 12 segundos para mantener Portátil y PC de Mesa sincronizados
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        runCloudSync('auto')
      }
    }, 12000)

    return () => {
      clearTimeout(initTimer)
      window.removeEventListener('focus', handleVisibilityOrFocus)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      clearInterval(pollInterval)
    }
  }, [isAuthenticated, user?.id, user?.businessId, runCloudSync, user])

  // Suscripción en tiempo real a cambios de bar_data en Supabase (Portátil <-> PC de Mesa instantáneo)
  useEffect(() => {
    const bizId = user?.businessId
    if (!isAuthenticated || !bizId || !isValidUuid(bizId)) return

    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAuthenticated, user?.businessId])

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
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-3.5 z-50 space-y-2.5">
                        <div className="pb-2 border-b border-zinc-800">
                          <p className="text-xs font-black text-white flex items-center space-x-1.5">
                            <Cloud className="w-4 h-4 text-emerald-400" />
                            <span>Sincronización Portátil ↔ PC</span>
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {syncTooltip} ({barData.products?.length || 0} productos en este equipo)
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            runCloudSync('push')
                            setShowCloudMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          🔼 Subir datos de este equipo a la Nube
                          <span className="block text-[10px] text-zinc-400 font-normal">
                            Úsalo en tu Portátil para enviar tus productos y stock
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            runCloudSync('pull')
                            setShowCloudMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          🔽 Traer datos de la Nube a este PC
                          <span className="block text-[10px] text-zinc-400 font-normal">
                            Úsalo en tu PC de Mesa para descargar todo tu bar
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