import './globals.css'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { Bell } from 'lucide-react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#121214] text-zinc-100 min-h-screen antialiased selection:bg-red-600 selection:text-white">
        <div className="flex min-h-screen">
          {/* Sidebar Escritorio */}
          <Sidebar />

          {/* Contenido Principal */}
          <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
            {/* Header Superior */}
            <header className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 flex items-center justify-between sticky top-0 z-40">
              <div className="flex items-center space-x-3">
                <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent font-black text-xl tracking-wider">
                  ⚡ ROCK BAR POS
                </span>
                <span className="hidden sm:inline-block text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full font-medium border border-zinc-700">
                  Turno Activo
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <button aria-label="Notificaciones" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                </button>

                <div className="flex items-center space-x-3 pl-3 border-l border-zinc-800">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-md shadow-red-900/30">
                    RB
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-zinc-200">Administrador</p>
                    <p className="text-[10px] text-amber-500 font-medium">Propietario</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Vista principal con padding */}
            <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Navegación inferior móvil */}
        <MobileNav />
      </body>
    </html>
  )
}
