'use client'

import { useState } from 'react'
import {
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  X,
  FileText,
  TrendingUp,
  Wallet,
  Coins,
} from 'lucide-react'
import {
  useBarStore,
  openCashShift,
  closeCashShift,
  addCashMovement,
  resetBarData,
  CashSessionRecord,
  CashMovementRecord,
} from '@/lib/barState'

export default function CajaPage() {
  const barData = useBarStore()
  const cash = barData.cash
  const movements = barData.movements || []
  const sessions = barData.sessions || []

  // Estados de modales
  const [showOpenModal, setShowOpenModal] = useState<boolean>(false)
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false)
  const [receiptSession, setReceiptSession] = useState<CashSessionRecord | null>(null)

  // Formulario Apertura de Turno
  const [openBaseAmount, setOpenBaseAmount] = useState<number>(150000)

  // Formulario Arqueo y Cierre de Turno
  const [closeActualCash, setCloseActualCash] = useState<number>(cash.expectedCash)
  const [closeNotes, setCloseNotes] = useState<string>('')

  // Formulario Entrada / Salida Menor
  const [movementType, setMovementType] = useState<'in' | 'out'>('out')
  const [movementCategory, setMovementCategory] = useState<string>('Insumos')
  const [movementDesc, setMovementDesc] = useState<string>('')
  const [movementAmount, setMovementAmount] = useState<number>(0)

  // Notificación
  const [notification, setNotification] = useState<string>('')

  const formatCOP = (val: number) => '$ ' + Math.abs(val).toLocaleString('es-CO')

  // Manejar apertura de turno
  const handleConfirmOpenShift = (e: React.FormEvent) => {
    e.preventDefault()
    if (openBaseAmount < 0) return

    openCashShift(openBaseAmount, barData.operatorName)
    setShowOpenModal(false)
    setCloseActualCash(openBaseAmount)
    setNotification(`¡Turno de caja abierto exitosamente con base de ${formatCOP(openBaseAmount)}!`)
    setTimeout(() => setNotification(''), 4500)
  }

  // Manejar confirmación de arqueo y cierre
  const handleConfirmCloseShift = (e: React.FormEvent) => {
    e.preventDefault()
    const closed = closeCashShift(closeActualCash, closeNotes)
    setShowCloseModal(false)
    setReceiptSession(closed)
    setNotification(`¡Turno de caja cerrado y arqueado! Cuadre guardado en el historial.`)
    setTimeout(() => setNotification(''), 4500)
  }

  // Manejar registro de gasto o ingreso menor
  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!movementDesc.trim() || movementAmount <= 0) return

    addCashMovement(movementType, movementCategory, movementAmount, movementDesc.trim())
    setMovementDesc('')
    setMovementAmount(0)
    setNotification(
      `${movementType === 'out' ? 'Gasto/Salida' : 'Ingreso/Inyección'} de ${formatCOP(
        movementAmount
      )} registrado en caja.`
    )
    setTimeout(() => setNotification(''), 4000)
  }

  const handleReset = () => {
    if (confirm('¿Deseas reiniciar los datos de prueba de caja al estado por defecto?')) {
      resetBarData()
      setNotification('Datos de prueba de caja reiniciados.')
      setTimeout(() => setNotification(''), 3000)
    }
  }

  // Cálculos de arqueo en tiempo real
  const currentDifference = closeActualCash - cash.expectedCash

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Turnos, Arqueos & Gastos • Operador Único</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestión y Arqueo de Caja
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Control de aperturas y cierres de turno, arqueo de efectivo físico y balance en tiempo real.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Reiniciar datos de prueba"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>

          {cash.status === 'open' ? (
            <button
              type="button"
              onClick={() => {
                setCloseActualCash(cash.expectedCash)
                setCloseNotes('')
                setShowCloseModal(true)
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-xs cursor-pointer active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>Arqueo y Cierre de Turno</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowOpenModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-xs cursor-pointer active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Nuevo Turno</span>
            </button>
          )}
        </div>
      </div>

      {/* Notificación Toast si existe */}
      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tarjeta de Sesión Activa */}
      <div
        className={`rock-card p-6 rounded-2xl border-l-4 space-y-4 ${
          cash.status === 'open' ? 'border-l-emerald-500' : 'border-l-red-600'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <span
              className={`p-3 rounded-2xl ${
                cash.status === 'open'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {cash.status === 'open' ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </span>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="font-black text-white text-xl">
                  {cash.status === 'open' ? 'Turno Activo en Operación' : 'Turno de Caja Cerrado'}
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                    cash.status === 'open'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                      : 'bg-red-500/20 text-red-400 border-red-500/40'
                  }`}
                >
                  {cash.status === 'open' ? 'Operando' : 'Cerrado'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center space-x-3">
                <span>
                  Operador: <strong className="text-white font-bold">{barData.operatorName}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                  Inicio: {cash.openedAt || 'Sin registrar'}
                </span>
              </p>
            </div>
          </div>

          <div className="sm:text-right bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Efectivo Físico Esperado en Cajón</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight mt-0.5">
              {formatCOP(cash.expectedCash)}
            </p>
            <span className="text-[10px] text-zinc-500">
              (Base {formatCOP(cash.initialCash)} + Ventas Ef. {formatCOP(cash.cashSales)} - Gastos {formatCOP(cash.expenses)})
            </span>
          </div>
        </div>

        {/* Desglose de Caja en Vivo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold flex items-center space-x-1">
              <Wallet className="w-3.5 h-3.5 text-zinc-500" />
              <span>Base Inicial</span>
            </p>
            <p className="text-lg font-black text-white mt-1.5">{formatCOP(cash.initialCash)}</p>
            <span className="text-[10px] text-zinc-500">Efectivo de apertura</span>
          </div>

          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ventas en Efectivo</span>
            </p>
            <p className="text-lg font-black text-emerald-400 mt-1.5">{formatCOP(cash.cashSales)}</p>
            <span className="text-[10px] text-zinc-500">Cobros físicos recibidos</span>
          </div>

          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Nequi / Datáfono</span>
            </p>
            <p className="text-lg font-black text-blue-400 mt-1.5">{formatCOP(cash.electronicSales)}</p>
            <span className="text-[10px] text-zinc-500">Ingresos bancarios directos</span>
          </div>

          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold flex items-center space-x-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
              <span>Gastos y Retiros</span>
            </p>
            <p className="text-lg font-black text-red-500 mt-1.5">-{formatCOP(cash.expenses)}</p>
            <span className="text-[10px] text-zinc-500">Salidas menores en efectivo</span>
          </div>
        </div>
      </div>

      {/* Grid: Formulario de Entradas/Salidas (5 cols) y Movimientos en Vivo (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Salidas y Entradas Menores */}
        <div className="lg:col-span-5 rock-card p-5 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800">
            <div className="p-1.5 rounded-lg bg-red-600/20 text-red-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Registrar Entrada / Salida Menor</h3>
              <p className="text-[11px] text-zinc-400">Gastos imprevistos, insumos o inyección de sencillo</p>
            </div>
          </div>

          <form onSubmit={handleAddMovement} className="space-y-3">
            {/* Tipo: Salida o Entrada */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('out')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  movementType === 'out'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                Salida (Gasto / Retiro)
              </button>
              <button
                type="button"
                onClick={() => setMovementType('in')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  movementType === 'in'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/30'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                Entrada (Base Extra)
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Categoría del Movimiento</label>
              <select
                value={movementCategory}
                onChange={(e) => setMovementCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {movementType === 'out' ? (
                  <>
                    <option value="Insumos">Insumos de Bar (Hielo, frutas, limones)</option>
                    <option value="Pago Proveedor">Pago a Proveedor Directo</option>
                    <option value="Servicios">Servicios / Domicilios / Taxi</option>
                    <option value="Retiro Dueño">Retiro Parcial de Caja Fuerte</option>
                    <option value="Otros Gastos">Otros Gastos Menores</option>
                  </>
                ) : (
                  <>
                    <option value="Base Extra">Inyección de Sencillo / Cambio</option>
                    <option value="Aporte Dueño">Aporte Adicional de Capital</option>
                    <option value="Devolución">Devolución / Ajuste a favor</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Motivo o Justificación *</label>
              <input
                type="text"
                required
                value={movementDesc}
                onChange={(e) => setMovementDesc(e.target.value)}
                placeholder="Ej. 2 bolsas de hielo gourmet, limones para cócteles..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Monto en COP ($) *</label>
              <input
                type="number"
                required
                min={100}
                step={100}
                value={movementAmount || ''}
                onChange={(e) => setMovementAmount(Number(e.target.value))}
                placeholder="Ej. 25000"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={cash.status !== 'open'}
              className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cash.status !== 'open'
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : movementType === 'out'
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {cash.status !== 'open'
                  ? 'Abre turno para registrar'
                  : movementType === 'out'
                  ? 'Descontar Gasto de Caja'
                  : 'Sumar Ingreso a Caja'}
              </span>
            </button>
          </form>
        </div>

        {/* Historial de Movimientos de la Sesión Actual */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Movimientos del Turno ({movements.length})
            </h3>
            <span className="text-[11px] text-zinc-500 font-medium">Cronológico en vivo</span>
          </div>

          <div className="rock-card rounded-2xl overflow-hidden divide-y divide-zinc-800/80 max-h-96 overflow-y-auto">
            {movements.length === 0 ? (
              <p className="p-8 text-center text-xs text-zinc-500">No hay movimientos registrados en este turno.</p>
            ) : (
              movements.map((m: CashMovementRecord) => (
                <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        m.type === 'out'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : m.type === 'sale'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {m.type === 'out' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-snug">{m.description}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        <span className="text-zinc-500 font-mono">{m.time}</span> • {m.category || 'Operación'} • Por{' '}
                        {m.user}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-black text-xs font-mono whitespace-nowrap pl-2 ${
                      m.amount < 0 ? 'text-red-500' : 'text-emerald-400'
                    }`}
                  >
                    {m.amount < 0 ? '-' : '+'} {formatCOP(m.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Historial de Turnos y Arqueos Cerrados */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-white">Historial de Turnos y Arqueos Anteriores</h3>
          </div>
          <span className="text-xs text-zinc-400">{sessions.length} turnos registrados</span>
        </div>

        {sessions.length === 0 ? (
          <div className="rock-card p-6 rounded-2xl text-center text-xs text-zinc-500">
            No hay turnos anteriores registrados en el historial aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s) => {
              const diff = s.difference || 0
              const isExact = diff === 0
              const isSurplus = diff > 0

              return (
                <div key={s.id} className="rock-card p-4 rounded-2xl border border-zinc-800 space-y-3 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block">{s.id}</span>
                      <span className="text-xs font-bold text-white">{s.operator}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isExact
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : isSurplus
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {isExact ? 'Cuadre Exacto' : isSurplus ? `Sobrante +${formatCOP(diff)}` : `Faltante -${formatCOP(diff)}`}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-zinc-400">
                    <div className="flex justify-between">
                      <span>Apertura:</span>
                      <span className="text-zinc-200">{s.openedAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cierre:</span>
                      <span className="text-zinc-200">{s.closedAt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Inicial:</span>
                      <span className="text-white font-mono">{formatCOP(s.initialCash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ventas Efectivo:</span>
                      <span className="text-emerald-400 font-mono">{formatCOP(s.cashSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ventas Nequi/Tarj:</span>
                      <span className="text-blue-400 font-mono">{formatCOP(s.electronicSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gastos Turno:</span>
                      <span className="text-red-400 font-mono">-{formatCOP(s.expenses)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-zinc-800/80 font-bold">
                      <span className="text-white">Efectivo Contado:</span>
                      <span className="text-amber-400 font-mono">{formatCOP(s.actualCash || s.expectedCash)}</span>
                    </div>
                  </div>

                  {s.notes && (
                    <p className="text-[11px] text-zinc-500 italic bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/50">
                      &quot;{s.notes}&quot;
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setReceiptSession(s)}
                    className="w-full py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3 h-3 text-zinc-400" />
                    <span>Ver Comprobante de Arqueo</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal: Apertura de Turno */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Apertura de Turno de Caja</h3>
                  <p className="text-xs text-zinc-400">Define la base inicial para cambio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOpenShift} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Base Inicial en Efectivo ($ COP) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={openBaseAmount}
                  onChange={(e) => setOpenBaseAmount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-lg font-black text-amber-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Botones sugeridos */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-500 font-semibold uppercase">Montos Frecuentes:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[50000, 100000, 150000, 200000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOpenBaseAmount(val)}
                      className="py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      ${val / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <p>• El turno iniciará a nombre de: <strong className="text-white">{barData.operatorName}</strong>.</p>
                <p>• Los cobros de las mesas sumarán automáticamente al balance en efectivo.</p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  Confirmar Apertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Arqueo y Cierre de Turno */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-lg p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Arqueo y Cierre de Turno</h3>
                  <p className="text-xs text-zinc-400">Cuadre de efectivo físico del cajón</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCloseShift} className="space-y-4">
              {/* Resumen Financiero del Turno */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Base Inicial de Apertura:</span>
                  <span className="text-white font-mono">{formatCOP(cash.initialCash)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>(+) Ventas en Efectivo:</span>
                  <span className="text-emerald-400 font-mono font-bold">+{formatCOP(cash.cashSales)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>(-) Gastos y Retiros Menores:</span>
                  <span className="text-red-400 font-mono font-bold">-{formatCOP(cash.expenses)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-black">
                  <span className="text-white">Total Efectivo Físico Esperado:</span>
                  <span className="text-amber-400 font-mono">{formatCOP(cash.expectedCash)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-900">
                  <span>Ventas Electrónicas (Bancos):</span>
                  <span className="text-blue-400 font-mono">{formatCOP(cash.electronicSales)}</span>
                </div>
              </div>

              {/* Conteo Real en Efectivo */}
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Efectivo Físico Real Contado en Cajón ($ COP) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={100}
                  value={closeActualCash}
                  onChange={(e) => setCloseActualCash(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xl font-black text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              {/* Comparador de Diferencia / Descuadre */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  currentDifference === 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : currentDifference > 0
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {currentDifference === 0 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {currentDifference === 0
                      ? 'Cuadre Exacto de Caja (Sin faltantes ni sobrantes)'
                      : currentDifference > 0
                      ? `Sobrante en Caja de +${formatCOP(currentDifference)}`
                      : `Faltante en Caja de -${formatCOP(currentDifference)}`}
                  </span>
                </div>
                <span className="font-mono text-sm">
                  {currentDifference > 0 ? '+' : ''}
                  {formatCOP(currentDifference)}
                </span>
              </div>

              {/* Observaciones */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Notas u Observaciones del Cierre</label>
                <textarea
                  rows={2}
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Ej. Se dejan $150.000 para el próximo turno y se entrega el resto al administrador..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                >
                  Confirmar Cierre y Arqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Comprobante / Ticket de Arqueo */}
      {receiptSession && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Comprobante de Arqueo de Caja</h3>
                  <p className="text-xs text-zinc-400">Registro oficial de cuadre</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptSession(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Estilo Térmico / Rock Bar */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-dashed border-zinc-800 font-mono text-xs space-y-3">
              <div className="text-center pb-2 border-b border-zinc-800">
                <h4 className="font-black text-white text-sm tracking-widest uppercase">ROCK BAR POS</h4>
                <p className="text-[10px] text-zinc-400">Comprobante de Cierre de Caja</p>
                <p className="text-[10px] text-zinc-500 mt-1">Sesión: {receiptSession.id}</p>
              </div>

              <div className="space-y-1 text-zinc-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Operador:</span>
                  <span>{receiptSession.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Apertura:</span>
                  <span>{receiptSession.openedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cierre:</span>
                  <span>{receiptSession.closedAt || 'Hoy'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-zinc-200 text-xs">
                <div className="flex justify-between">
                  <span>Base Inicial:</span>
                  <span>{formatCOP(receiptSession.initialCash)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Ventas Efectivo:</span>
                  <span>+{formatCOP(receiptSession.cashSales)}</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>Ventas Nequi/Tarj:</span>
                  <span>+{formatCOP(receiptSession.electronicSales)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Gastos / Salidas:</span>
                  <span>-{formatCOP(receiptSession.expenses)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-800 font-bold text-white">
                  <span>Efectivo Esperado:</span>
                  <span>{formatCOP(receiptSession.expectedCash)}</span>
                </div>
                <div className="flex justify-between font-black text-amber-400 text-sm">
                  <span>Efectivo Real Contado:</span>
                  <span>{formatCOP(receiptSession.actualCash || receiptSession.expectedCash)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-zinc-800 text-[11px]">
                  <span>Diferencia:</span>
                  <span
                    className={
                      (receiptSession.difference || 0) === 0
                        ? 'text-emerald-400'
                        : (receiptSession.difference || 0) > 0
                        ? 'text-blue-400'
                        : 'text-red-400'
                    }
                  >
                    {(receiptSession.difference || 0) === 0
                      ? 'Cuadre Exacto'
                      : (receiptSession.difference || 0) > 0
                      ? `Sobrante +${formatCOP(receiptSession.difference || 0)}`
                      : `Faltante -${formatCOP(receiptSession.difference || 0)}`}
                  </span>
                </div>
              </div>

              {receiptSession.notes && (
                <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 italic">
                  Notas: {receiptSession.notes}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptSession(null)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
