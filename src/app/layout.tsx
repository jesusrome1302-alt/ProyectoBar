"use client"

import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { Bell, UserCheck } from 'lucide-react'
import { useAuthStore } from '@/lib/authStore'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const isLoginPage = pathname === '/login'

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
  }[user?.role || 'owner']

  return (
    <html lang="es" className="dark">
      <body className="bg-[#121214] text-zinc-100 min-h-screen antialiased selection:bg-red-600 selection:text-white">
        <div className="flex min-h-screen">
          {/* Sidebar Escritorio (no se muestra en login) */}
          {!isLoginPage && <Sidebar />}

          {/* Contenido Principal */}
          <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
            {/* Header Superior (no se muestra en login) */}
            {!isLoginPage && (
              <header className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center space-x-3">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent font-black text-xl tracking-wider">
                      ⚡ ROCK BAR POS
                    </span>
                  </Link>
                  <span className="hidden sm:inline-block text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full font-medium border border-zinc-700">
                    Turno Activo
                  </span>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                  <button
                    aria-label="Notificaciones"
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                  </button>

                  <Link
                    href="/login"
                    title="Clic para cambiar de rol o usuario"
                    className="flex items-center space-x-2.5 pl-3 border-l border-zinc-800 hover:opacity-85 transition-opacity group cursor-pointer"
                  >
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr ${roleStyles.gradient} flex items-center justify-center font-bold text-white text-xs shadow-md shadow-red-900/30 group-hover:scale-105 transition-transform`}>
                      {user?.avatar || 'RB'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="flex items-center space-x-1.5">
                        <p className="text-xs font-bold text-zinc-200">{user?.name || 'Carlos Santana'}</p>
                        <UserCheck className="w-3 h-3 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${roleStyles.badge}`}>
                        {roleStyles.tag}
                      </span>
                    </div>
                  </Link>
                </div>
              </header>
            )}

            {/* Vista principal con padding */}
            <main className={`flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto ${isLoginPage ? 'flex items-center justify-center' : ''}`}>
              {children}
            </main>
          </div>
        </div>

        {/* Navegación inferior móvil (no se muestra en login) */}
        {!isLoginPage && <MobileNav />}
      </body>
    </html>
  )
}