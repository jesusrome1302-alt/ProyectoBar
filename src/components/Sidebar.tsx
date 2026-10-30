"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  ReceiptText,
  DollarSign,
  BarChart3,
  Settings,
  ShieldAlert,
  UserCheck
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/lib/authStore'

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className: string }>
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Panel Principal', href: '/', icon: LayoutDashboard, roles: ['owner', 'admin', 'staff'] },
  { name: 'Mesas', href: '/mesas', icon: UtensilsCrossed, roles: ['owner', 'admin', 'staff'] },
  { name: 'Ventas / Barra', href: '/ventas', icon: ShoppingBag, roles: ['owner', 'admin', 'staff'] },
  { name: 'Cobro / Cuentas', href: '/cobro', icon: ReceiptText, roles: ['owner', 'admin'] },
  { name: 'Productos & Kardex', href: '/productos', icon: Package, roles: ['owner', 'admin'] },
  { name: 'Caja & Turnos', href: '/caja', icon: DollarSign, roles: ['owner', 'admin'] },
  { name: 'Reportes', href: '/reportes', icon: BarChart3, roles: ['owner', 'admin'] },
  { name: 'Configuración', href: '/configuracion', icon: Settings, roles: ['owner'] },
  { name: 'Usuarios y Roles', href: '/usuarios', icon: ShieldAlert, roles: ['owner'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const currentRole: UserRole = user?.role || 'owner'

  // Filtrar ítems autorizados para el rol actual
  const authorizedItems = NAV_ITEMS.filter((item) => item.roles.includes(currentRole))

  const roleBadgeStyle = {
    owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    admin: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    staff: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }[currentRole]

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        {/* Logo / Cabecera Rock Bar */}
        <Link href="/" className="p-6 border-b border-zinc-800 flex items-center space-x-3 block hover:bg-zinc-900/40 transition-colors">
          <div className="bg-red-600 p-2.5 rounded-xl text-white font-black text-xl tracking-wider shadow-lg shadow-red-900/50 flex items-center justify-center">
            🎸
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">ROCK BAR</h1>
            <p className="text-[11px] text-amber-500 font-semibold uppercase tracking-wider">Sistema de Gestión</p>
          </div>
        </Link>

        {/* Navegación según Rol */}
        <nav className="p-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
            <span>Módulos de Trabajo</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase ${roleBadgeStyle}`}>
              {currentRole}
            </span>
          </div>

          {authorizedItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-500 group-hover:text-red-500'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Info de sesión y cambio de usuario */}
      <div className="p-4 border-t border-zinc-800 space-y-2">
        <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-xs font-black text-white shrink-0">
              {user?.avatar || 'RB'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-zinc-200 truncate">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-zinc-400 truncate">{user?.roleTitle || 'Personal'}</p>
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-red-600/10 hover:border-red-500/40 text-zinc-400 hover:text-red-400 text-xs font-semibold transition-all"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Cambiar Rol / Salir</span>
        </Link>
      </div>
    </aside>
  )
}