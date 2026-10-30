import Link from 'next/link'
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Package, ReceiptText, DollarSign, BarChart3, Settings, ShieldAlert } from 'lucide-react'

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className: string }>
  condition?: boolean
}

export default function Sidebar({ isOwner, isAdminOrOwner, userName }: { isOwner: boolean; isAdminOrOwner: boolean; userName: string }) {
  // Ítems de navegación - owner ve todos
  const ownerNavItems: NavItem[] = [
    { name: 'Panel Principal', href: '/', icon: LayoutDashboard },
    { name: 'Mesas', href: '/mesas', icon: UtensilsCrossed },
    { name: 'Ventas / Barra', href: '/ventas', icon: ShoppingBag },
    { name: 'Cobro / Cuentas', href: '/cobro', icon: ReceiptText },
    { name: 'Productos', href: '/productos', icon: Package },
    { name: 'Caja', href: '/caja', icon: DollarSign },
    { name: 'Reportes', href: '/reportes', icon: BarChart3 },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
  ]

  // Ítems restringidos - solo admin/owner
  const restrictedNavItems: NavItem[] = [
    { name: 'Usuarios y Permisos', href: '/usuarios', icon: ShieldAlert, condition: isAdminOrOwner },
  ]

  // Ítems que todo el mundo (incluyendo staff) puede ver
  const publicNavItems: NavItem[] = [
    { name: 'Panel Principal', href: '/', icon: LayoutDashboard },
    { name: 'Mesas', href: '/mesas', icon: UtensilsCrossed },
    { name: 'Ventas / Barra', href: '/ventas', icon: ShoppingBag },
  ]

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between hidden md:flex">
      <div>
        {/* Logo / Cabecera Rock Bar */}
        <div className="p-6 border-b border-zinc-800 flex items-center space-x-3">
          <div className="bg-red-600 p-2 rounded-lg text-white font-black text-xl tracking-wider shadow-lg shadow-red-900/50">
            🎸
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">ROCK BAR</h1>
            <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider">Sistema de Gestión</p>
          </div>
        </div>

        {/* Navegación - muestra diferente contenido según rol */}
        <nav className="p-4 space-y-1.5">
          {/* Siempre mostramos items públicos */}
          {publicNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-medium group"
              >
                <Icon className="w-5 h-5 text-zinc-500 group-hover:text-red-500 transition-colors" />
                <span>{item.name}</span>
              </Link>
            )
          })}

          {/* Items adicionales para owner/admin (condicionales) */}
          {isOwner && isAdminOrOwner && ownerNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-medium group"
              >
                <Icon className="w-5 h-5 text-zinc-500 group-hover:text-red-500 transition-colors" />
                <span>{item.name}</span>
              </Link>
            )
          })}

          {/* Items restringidos (admin/owner solo) */}
          {isAdminOrOwner && restrictedNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-medium group"
              >
                <Icon className="w-5 h-5 text-zinc-500 group-hover:text-red-500 transition-colors" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Info inferior de sesión */}
      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-300 truncate">{userName || 'Modo Local'}</p>
              <p className="text-[10px] text-zinc-500 truncate">Conectado</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}