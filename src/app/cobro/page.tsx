import { ReceiptText, CreditCard, DollarSign, Smartphone, Landmark, CheckCircle, AlertCircle, Printer } from 'lucide-react'
import Link from 'next/link'

export default function CobroPage() {
  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')

  // Cuentas activas en salón y barra
  const openAccounts = [
    {
      id: 'acc-3',
      title: 'Mesa 3',
      type: 'table',
      openedAt: 'Hoy, 05:15 PM',
      waiter: 'Admin',
      total: 89000,
      paid: 50000,
      pending: 39000,
      status: 'partial', // partial | unpaid | settled
      items: [
        { name: 'Cerveza Corona 355ml', qty: 3, unitPrice: 14000, subtotal: 42000 },
        { name: 'Cóctel Rock Margarita', qty: 1, unitPrice: 32000, subtotal: 32000 },
        { name: 'Red Bull 250ml', qty: 1, unitPrice: 15000, subtotal: 15000 },
      ],
      payments: [
        { id: 'pay-1', method: 'Nequi / Daviplata', amount: 50000, time: '05:40 PM', user: 'Admin' },
      ],
    },
    {
      id: 'acc-1',
      title: 'Mesa 1',
      type: 'table',
      openedAt: 'Hoy, 04:30 PM',
      waiter: 'Staff 1',
      total: 125000,
      paid: 0,
      pending: 125000,
      status: 'unpaid',
      items: [
        { name: 'Ron Medellín Añejo 8A (Tragos)', qty: 4, unitPrice: 18000, subtotal: 72000 },
        { name: 'Alitas BBQ Rocker x8', qty: 1, unitPrice: 34000, subtotal: 34000 },
        { name: 'Papas Rústicas', qty: 1, unitPrice: 19000, subtotal: 19000 },
      ],
      payments: [],
    },
    {
      id: 'acc-5',
      title: 'Mesa 5',
      type: 'table',
      openedAt: 'Hoy, 04:00 PM',
      waiter: 'Admin',
      total: 210000,
      paid: 210000,
      pending: 0,
      status: 'settled', // Saldo en cero, lista para cerrar y liberar mesa
      items: [
        { name: 'Whisky Johnnie Walker Black (Media)', qty: 1, unitPrice: 140000, subtotal: 140000 },
        { name: 'Nachos Cheddar & Jalapeños', qty: 2, unitPrice: 26000, subtotal: 52000 },
        { name: 'Cerveza Poker', qty: 2, unitPrice: 9000, subtotal: 18000 },
      ],
      payments: [
        { id: 'pay-2', method: 'Tarjeta Débito', amount: 150000, time: '05:10 PM', user: 'Admin' },
        { id: 'pay-3', method: 'Efectivo', amount: 60000, time: '05:25 PM', user: 'Admin' },
      ],
    },
    {
      id: 'acc-direct-104',
      title: 'Venta Directa #104 (Barra)',
      type: 'direct',
      openedAt: 'Hoy, 05:45 PM',
      waiter: 'Admin',
      total: 28000,
      paid: 0,
      pending: 28000,
      status: 'unpaid',
      items: [
        { name: 'Mojito Cubano Clásico', qty: 1, unitPrice: 28000, subtotal: 28000 },
      ],
      payments: [],
    },
  ]

  // Cuenta en foco para cobrar (Mesa 3 con pago parcial previo)
  const currentAccount = openAccounts[0]

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <ReceiptText className="w-4 h-4" />
            <span>Módulo de Facturación & Cobros</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cuentas, Cobros & Cierre
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Gestión de pagos parciales (abonos), múltiples métodos de pago y liberación de mesas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/ventas"
            className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold px-4 py-2.5 rounded-xl transition-all text-xs"
          >
            <span>+ Nueva Venta / Pedido</span>
          </Link>
        </div>
      </div>

      {/* Grid Principal: Lista de Cuentas Abiertas (izq) y Panel de Cobro Detallado (der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Selector de Cuentas Abiertas (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Cuentas por Cobrar</h3>
            <span className="text-xs bg-zinc-800 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-zinc-700">
              {openAccounts.length} abiertas
            </span>
          </div>

          <div className="space-y-2.5">
            {openAccounts.map((acc) => {
              const isSelected = acc.id === currentAccount.id
              const isSettled = acc.status === 'settled'

              return (
                <div
                  key={acc.id}
                  className={`rock-card p-4 rounded-2xl transition-all cursor-pointer border-l-4 ${
                    isSelected
                      ? 'border-l-red-600 bg-zinc-900 shadow-lg shadow-red-900/10'
                      : isSettled
                      ? 'border-l-emerald-500 hover:border-l-emerald-400'
                      : 'border-l-amber-500 hover:border-l-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-base">{acc.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isSettled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : acc.status === 'partial'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {isSettled ? 'Saldada ($0)' : acc.status === 'partial' ? 'Abonada' : 'Pendiente'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                    <span>Total: <strong className="text-white">{formatCOP(acc.total)}</strong></span>
                    <span>
                      Saldo:{' '}
                      <strong className={acc.pending > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {formatCOP(acc.pending)}
                      </strong>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel de Cobro y Liquidación (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Tarjeta de Cuenta Seleccionada */}
          <div className="rock-card p-6 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-xl text-white">{currentAccount.title}</h3>
                  <span className="text-xs bg-red-600/20 text-red-400 px-2.5 py-0.5 rounded-full font-bold border border-red-600/30">
                    Cuenta Abierta
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Atendida por: <strong className="text-white">{currentAccount.waiter}</strong> • {currentAccount.openedAt}
                </p>
              </div>

              {/* Indicadores Financieros de la Cuenta */}
              <div className="flex items-center space-x-4 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Total Consumo</p>
                  <p className="text-sm font-black text-white">{formatCOP(currentAccount.total)}</p>
                </div>
                <div className="border-l border-zinc-800 pl-4">
                  <p className="text-[10px] text-emerald-400 uppercase font-bold">Total Abonado</p>
                  <p className="text-sm font-black text-emerald-400">{formatCOP(currentAccount.paid)}</p>
                </div>
                <div className="border-l border-zinc-800 pl-4">
                  <p className="text-[10px] text-amber-500 uppercase font-bold">Saldo por Cobrar</p>
                  <p className="text-base font-black text-amber-400">{formatCOP(currentAccount.pending)}</p>
                </div>
              </div>
            </div>

            {/* Consumo y Abonos en 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detalle de Artículos */}
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Artículos de la Cuenta</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {currentAccount.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-zinc-900 last:border-0">
                      <div>
                        <p className="font-bold text-white">{it.name}</p>
                        <p className="text-[10px] text-zinc-500">{it.qty} x {formatCOP(it.unitPrice)}</p>
                      </div>
                      <span className="font-black text-zinc-200">{formatCOP(it.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial de Pagos / Abonos Registrados */}
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Historial de Abonos / Pagos</p>
                {currentAccount.payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-28 text-center text-zinc-500">
                    <AlertCircle className="w-5 h-5 mb-1" />
                    <p className="text-xs">No hay abonos registrados aún en esta cuenta.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentAccount.payments.map((pay) => (
                      <div key={pay.id} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="font-bold text-white">{pay.method}</p>
                            <p className="text-[10px] text-zinc-500">{pay.time} • Por {pay.user}</p>
                          </div>
                        </div>
                        <span className="font-black text-emerald-400">+{formatCOP(pay.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Módulo de Registro de Pago (Efectivo / Transferencia / Tarjeta) */}
            <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm uppercase tracking-wide flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  <span>Registrar Pago / Abono Parcial</span>
                </h4>
                <span className="text-xs text-zinc-400">
                  Saldo Restante: <strong className="text-amber-400">{formatCOP(currentAccount.pending)}</strong>
                </span>
              </div>

              {/* Selector de Método de Pago */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-600 bg-red-600/10 text-white font-bold text-xs space-y-1 shadow-md shadow-red-900/20">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Efectivo</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white font-bold text-xs space-y-1 transition-colors">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>Nequi / Daviplata</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white font-bold text-xs space-y-1 transition-colors">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Datáfono / Tarjeta</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white font-bold text-xs space-y-1 transition-colors">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span>Transferencia</span>
                </button>
              </div>

              {/* Monto a Cobrar y Calculadora de Cambio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Monto del Pago (COP)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">$</span>
                    <input
                      type="number"
                      defaultValue={currentAccount.pending}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-base font-black text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex items-center space-x-1.5 mt-2">
                    <button className="text-[10px] font-bold bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 rounded-md">
                      Pagar Saldo ({formatCOP(currentAccount.pending)})
                    </button>
                    <button className="text-[10px] font-bold bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 rounded-md">
                      $ 20.000
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Efectivo Recibido (Cálculo de Vueltos)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">$</span>
                    <input
                      type="number"
                      defaultValue={50000}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-base font-black text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    Cambio / Vueltos al cliente:{' '}
                    <strong className="text-emerald-400 font-black">{formatCOP(11000)}</strong>
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar Pago de {formatCOP(currentAccount.pending)}</span>
                </button>

                <button
                  disabled={currentAccount.pending > 0}
                  className={`flex items-center justify-center space-x-2 font-bold py-3 rounded-xl transition-all text-sm ${
                    currentAccount.pending === 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/40'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {currentAccount.pending === 0
                      ? 'Cerrar Cuenta y Liberar Mesa'
                      : 'Debe saldar a $0 para cerrar'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
