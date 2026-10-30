"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  ReceiptText,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  UserCheck
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/lib/authStore'

type MobileNavItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className: string }>
  roles: UserRole[]
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { name: 'Panel', href: '/', icon: LayoutDashboard, roles: ['owner', 'admin', 'staff'] },
  { name: 'Mesas', href: '/mesas', icon: UtensilsCrossed, roles: ['owner', 'admin', 'staff'] },
  { name: 'Ventas', href: '/ventas', icon: ShoppingBag, roles: ['owner', 'admin', 'staff'] },
  { name: 'Cobro', href: '/cobro', icon: ReceiptText, roles: ['owner', 'admin'] },
  { name: 'Caja', href: '/caja', icon: DollarSign, roles: ['owner', 'admin'] },
  { name: 'Inventario', href: '/productos', icon: Package, roles: ['owner', 'admin'] },
  { name: 'Reportes', href: '/reportes', icon: BarChart3, roles: ['owner', 'admin'] },
  { name: 'Ajustes', href: '/configuracion', icon: Settings, roles: ['owner'] },
]

export default function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const currentRole: UserRole = user?.role || 'owner'

  const authorizedItems = MOBILE_NAV_ITEMS.filter((item) => item.roles.includes(currentRole))

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 z-50 px-2 py-1.5 flex justify-around items-center overflow-x-auto">
      {authorizedItems.slice(0, 5).map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center p-1.5 min-w-[50px] rounded-lg transition-colors ${
              isActive ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] truncate">{item.name}</span>
          </Link>
        )
      })}

      <Link
        href="/login"
        className="flex flex-col items-center justify-center p-1.5 min-w-[50px] text-amber-500 hover:text-amber-400"
      >
        <UserCheck className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] font-semibold">{user?.role?.toUpperCase() || 'LOGIN'}</span>
      </Link>
    </div>
  )
}