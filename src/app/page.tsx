import { UtensilsCrossed, DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { name: 'Ventas del Día', value: '$ 480.000', change: '+12%', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { name: 'Mesas Ocupadas', value: '4 / 9', change: '44% Cap.', icon: UtensilsCrossed, color: 'text-red-500', bg: 'bg-red-500/10' },
    { name: 'Pedidos Activos', value: '7', change: 'En barra y mesas', icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Alertas Stock', value: '2', change: 'Bajo inventario', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ]

  const mockTables = [
    { id: 1, name: 'Mesa 1', status: 'occupied', total: '$ 125.000', items: 4 },
    { id: 2, name: 'Mesa 2', status: 'available', total: '$ 0', items: 0 },
    { id: 3, name: 'Mesa 3', status: 'occupied', total: '$ 89.000', items: 3 },
    { id: 4, name: 'Mesa 4', status: 'available', total: '$ 0', items: 0 },
    { id: 5, name: 'Mesa 5', status: 'occupied', total: '$ 210.000', items: 8 },
    { id: 6, name: 'Mesa 6', status: 'available', total: '$ 0', items: 0 },
    { id: 7, name: 'Mesa 7', status: 'reserved', total: '$ 0', items: 0 },
    { id: 8, name: 'Mesa 8', status: 'available', total: '$ 0', items: 0 },
    { id: 9, name: 'Mesa 9', status: 'occupied', total: '$ 56.000', items: 2 },
  ]

  return (
    <div className="space-y-8">
      {/* Banner de Bienvenida */}
      <div className="relative overflow-hidden rounded-3xl rock-gradient p-6 sm:p-8 border border-red-900/40 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-red-600/30 border border-red-500/40 px-3 py-1 rounded-full text-amber-400 text-xs font-semibold mb-4">
            <span>🔥 Live Session</span>
            <span>•</span>
            <span>Rock & Metal Bar</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Panel de Operaciones
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base max-w-xl">
            Control en tiempo real de mesas, pedidos, caja e inventario. ¡Que suene el rock! 🎸
          </p>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="rock-card p-6 rounded-2xl shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{stat.name}</p>
                  <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-zinc-400">
                <span className="text-emerald-400 font-bold mr-1.5 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  {stat.change}
                </span>
                <span>respecto a ayer</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mapa de Mesas Rápido */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide">Estado de Mesas (1 - 9)</h3>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-zinc-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Libre</span>
            </span>
            <span className="flex items-center space-x-1.5 text-zinc-300">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span>Ocupada</span>
            </span>
            <span className="flex items-center space-x-1.5 text-zinc-300">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Reservada</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {mockTables.map((table) => {
            const isOccupied = table.status === 'occupied'
            const isReserved = table.status === 'reserved'
            return (
              <div
                key={table.id}
                className={`rock-card p-5 rounded-2xl transition-all border-l-4 ${
                  isOccupied
                    ? 'border-l-red-600 bg-zinc-900/90'
                    : isReserved
                    ? 'border-l-amber-500 bg-zinc-900/90'
                    : 'border-l-emerald-500 bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-lg">{table.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isOccupied
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isReserved
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isOccupied ? 'Ocupada' : isReserved ? 'Reservada' : 'Disponible'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs">Total Consumo</p>
                    <p className="font-bold text-white text-base">{table.total}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-xs">Artículos</p>
                    <p className="font-semibold text-zinc-300">{table.items} ítems</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
