import Link from 'next/link'
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, DollarSign, BarChart3 } from 'lucide-react'

export default function MobileNav() {
  const navItems = [
    { name: 'Panel', href: '/', icon: LayoutDashboard },
    { name: 'Mesas', href: '/mesas', icon: UtensilsCrossed },
    { name: 'Ventas', href: '/ventas', icon: ShoppingBag },
    { name: 'Caja', href: '/caja', icon: DollarSign },
    { name: 'Reportes', href: '/reportes', icon: BarChart3 },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50 px-2 py-2 flex justify-around items-center">
      {navItems.map((item) => {
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
    </div>
  )
}
