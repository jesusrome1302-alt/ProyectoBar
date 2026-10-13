import { DollarSign, ArrowDownRight, ArrowUpRight, Lock, Unlock } from 'lucide-react'

export default function CajaPage() {
  const currentSession = {
    id: 'cs-01',
    status: 'open',
    openedAt: 'Hoy, 04:00 PM',
    openedBy: 'Admin (Propietario)',
    initialCash: 150000,
    cashSales: 320000,
    electronicSales: 160000,
    totalExpenses: 45000,
    expectedCash: 425000, // 150000 + 320000 - 45000
  }

  const movements = [
    { id: '1', type: 'in', description: 'Base inicial de caja', amount: 150000, time: '04:00 PM', user: 'Admin' },
    { id: '2', type: 'out', description: 'Compra hielo de emergencia', amount: -25000, time: '05:30 PM', user: 'Admin' },
    { id: '3', type: 'out', description: 'Pago proveedor limones y menta', amount: -20000, time: '06:15 PM', user: 'Admin' },
    { id: '4', type: 'sale', description: 'Venta en efectivo #004', amount: 85000, time: '06:45 PM', user: 'Admin' },
  ]

  const formatCOP = (val: number) => '$ ' + Math.abs(val).toLocaleString('es-CO')

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Turnos & Arqueo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestión de Caja
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Control de aperturas, cierres de turno, retiros y conciliación de efectivo.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm">
            <Lock className="w-4 h-4" />
            <span>Cerrar Turno de Caja</span>
          </button>
        </div>
      </div>

      {/* Tarjeta de Sesión Activa */}
      <div className="rock-card p-6 rounded-2xl border-l-4 border-l-emerald-500 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Unlock className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-lg">Turno Activo</h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  En Operación
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Iniciado por <strong className="text-white">{currentSession.openedBy}</strong> • {currentSession.openedAt}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-400 uppercase">Efectivo Físico Esperado</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400">{formatCOP(currentSession.expectedCash)}</p>
          </div>
        </div>

        {/* Desglose de Caja */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div>
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Base Inicial</p>
            <p className="text-lg font-black text-white mt-1">{formatCOP(currentSession.initialCash)}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Ventas en Efectivo</p>
            <p className="text-lg font-black text-emerald-400 mt-1">{formatCOP(currentSession.cashSales)}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Transferencias / Datafono</p>
            <p className="text-lg font-black text-blue-400 mt-1">{formatCOP(currentSession.electronicSales)}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Gastos & Salidas</p>
            <p className="text-lg font-black text-red-500 mt-1">-{formatCOP(currentSession.totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos del Turno */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white tracking-wide">Movimientos del Turno</h3>
        <div className="rock-card rounded-2xl overflow-hidden divide-y divide-zinc-800/80">
          {movements.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-xl ${
                    m.type === 'out'
                      ? 'bg-red-500/10 text-red-500'
                      : m.type === 'sale'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {m.type === 'out' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white">{m.description}</p>
                  <p className="text-[11px] text-zinc-500">
                    {m.time} • Por {m.user}
                  </p>
                </div>
              </div>
              <p
                className={`font-black text-sm ${
                  m.amount < 0 ? 'text-red-500' : 'text-emerald-400'
                }`}
              >
                {m.amount < 0 ? '-' : '+'} {formatCOP(m.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
