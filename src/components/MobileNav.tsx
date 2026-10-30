import Link from 'next/link'
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, ReceiptText, Package, DollarSign, BarChart3, Settings, ShieldAlert } from 'lucide-react'

export default function MobileNav({ isOwner, isAdminOrOwner }: { isOwner: boolean; isAdminOrOwner: boolean }) {
  // Ítems que todo el usuario puede ver (incluso staff)
  const publicNavItems = [
    { name: 'Panel', href: '/', icon: LayoutDashboard },
    { name: 'Mesas', href: '/mesas', icon: UtensilsCrossed },
    { name: 'Ventas', href: '/ventas', icon: ShoppingBag },
  ]

  // Ítems para owner y admin
  const ownerAdminNavItems = [
    { name: 'Cobro / Cuentas', href: '/cobro', icon: ReceiptText },
    { name: 'Productos', href: '/productos', icon: Package },
    { name: 'Caja', href: '/caja', icon: DollarSign },
    { name: 'Reportes', href: '/reportes', icon: BarChart3 },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50 px-2 py-2 flex justify-around items-center">
      {/* Items públicos - siempre visibles */}
      {publicNavItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center p-2 text-zinc-400 hover:text-red-500 transition-colors"
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        )
      })}

      {/* Items de owner/admin - condicionales */}
      {isOwner || isAdminOrOwner && ownerAdminNavItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center p-2 text-zinc-400 hover:text-red-500 transition-colors"
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        )
      })}

      {/* Botón de logout - siempre visible */}
      <Link href="/">
        <div className="flex flex-col items-center justify-center p-2 text-zinc-400 hover:text-red-500 transition-colors">
          <ShieldAlert className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Cerrar</span>
        </div>
      </Link>
    </div>
  )
}