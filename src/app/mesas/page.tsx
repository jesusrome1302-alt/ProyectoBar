import { UtensilsCrossed, Plus, Users, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function MesasPage() {
  const tables = [
    { id: 1, name: 'Mesa 1', status: 'occupied', capacity: 4, orderTotal: 125000, itemsCount: 4, duration: '45 min' },
    { id: 2, name: 'Mesa 2', status: 'available', capacity: 2, orderTotal: 0, itemsCount: 0, duration: '-' },
    { id: 3, name: 'Mesa 3', status: 'occupied', capacity: 6, orderTotal: 89000, itemsCount: 3, duration: '20 min' },
    { id: 4, name: 'Mesa 4', status: 'available', capacity: 4, orderTotal: 0, itemsCount: 0, duration: '-' },
    { id: 5, name: 'Mesa 5', status: 'occupied', capacity: 8, orderTotal: 210000, itemsCount: 8, duration: '1h 15m' },
    { id: 6, name: 'Mesa 6', status: 'available', capacity: 4, orderTotal: 0, itemsCount: 0, duration: '-' },
    { id: 7, name: 'Mesa 7', status: 'reserved', capacity: 4, orderTotal: 0, itemsCount: 0, duration: 'Reserva 8:00 PM' },
    { id: 8, name: 'Mesa 8', status: 'available', capacity: 2, orderTotal: 0, itemsCount: 0, duration: '-' },
    { id: 9, name: 'Mesa 9', status: 'occupied', capacity: 6, orderTotal: 56000, itemsCount: 2, duration: '10 min' },
  ]

  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length
  const availableCount = tables.filter((t) => t.status === 'available').length
  const reservedCount = tables.filter((t) => t.status === 'reserved').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Salón & Barra</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mapa de Mesas (1 al 9)
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Monitoreo en tiempo real de cuentas activas, reservas y mesas disponibles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/ventas"
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Nuevo Pedido</span>
          </Link>
        </div>
      </div>

      {/* Resumen de Estado */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rock-card p-4 rounded-xl border-l-4 border-l-emerald-500">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase">Disponibles</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{availableCount}</p>
        </div>
        <div className="rock-card p-4 rounded-xl border-l-4 border-l-red-600">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase">Ocupadas</p>
          <p className="text-xl sm:text-2xl font-black text-red-500 mt-1">{occupiedCount}</p>
        </div>
        <div className="rock-card p-4 rounded-xl border-l-4 border-l-amber-500">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase">Reservadas</p>
          <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">{reservedCount}</p>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((t) => {
          const isOccupied = t.status === 'occupied'
          const isReserved = t.status === 'reserved'

          return (
            <div
              key={t.id}
              className={`rock-card p-5 rounded-2xl transition-all border-l-4 flex flex-col justify-between ${
                isOccupied
                  ? 'border-l-red-600 bg-zinc-900/90'
                  : isReserved
                  ? 'border-l-amber-500 bg-zinc-900/90'
                  : 'border-l-emerald-500 bg-zinc-900/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-lg">{t.name}</span>
                    <span className="text-[11px] text-zinc-500 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {t.capacity}p
                    </span>
                  </div>
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

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 my-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Cuenta actual:</span>
                    <span className="font-black text-white text-sm">{formatCOP(t.orderTotal)}</span>
                  </div>
                  {isOccupied && (
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                      <span>{t.itemsCount} productos</span>
                      <span className="flex items-center text-amber-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {t.duration}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <Link
                  href="/ventas"
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
                >
                  <span>{isOccupied ? 'Ver Comanda' : 'Abrir Mesa'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
