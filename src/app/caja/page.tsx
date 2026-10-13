'use client'

import { useState } from 'react'
import { DollarSign, ArrowDownRight, ArrowUpRight, Lock, Unlock, Plus, RefreshCw, CheckCircle } from 'lucide-react'
import { useBarStore, loadBarData, saveBarData, resetBarData, CashMovementRecord } from '@/lib/barState'

export default function CajaPage() {
  const barData = useBarStore()
  const cash = barData.cash
  const movements = barData.movements

  const [expenseDesc, setExpenseDesc] = useState<string>('')
  const [expenseAmount, setExpenseAmount] = useState<number>(0)
  const [notification, setNotification] = useState<string>('')

  const formatCOP = (val: number) => '$ ' + Math.abs(val).toLocaleString('es-CO')

  // Registrar un gasto o salida de caja
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseDesc || expenseAmount <= 0) return

    const data = loadBarData()
    const now = new Date()
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    data.cash.expenses += expenseAmount
    data.cash.expectedCash -= expenseAmount

    const newMov: CashMovementRecord = {
      id: 'mov-' + Date.now(),
      type: 'out',
      description: expenseDesc,
      amount: -expenseAmount,
      time: timeStr,
      user: data.operatorName,
    }

    data.movements.unshift(newMov)
    saveBarData(data)
    setExpenseDesc('')
    setExpenseAmount(0)
    setNotification(`Gasto de ${formatCOP(expenseAmount)} ("${expenseDesc}") registrado en caja.`)
    setTimeout(() => setNotification(''), 4000)
  }

  // Alternar estado de turno (abrir / cerrar)
  const handleToggleShift = () => {
    const data = loadBarData()
    const newStatus = data.cash.status === 'open' ? 'closed' : 'open'
    data.cash.status = newStatus
    saveBarData(data)
    setNotification(
      newStatus === 'closed'
        ? '¡Turno de caja cerrado con éxito! Cuadre final registrado.'
        : '¡Nuevo turno de caja iniciado con éxito!'
    )
    setTimeout(() => setNotification(''), 4000)
  }

  const handleReset = () => {
    if (confirm('¿Deseas reiniciar los datos de prueba?')) {
      resetBarData()
      setNotification('Datos de prueba reiniciados.')
      setTimeout(() => setNotification(''), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Turnos & Arqueo en Vivo • Operador Único</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestión de Caja
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Sincronización en tiempo real con los cobros en efectivo y transferencias de las mesas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
          <button
            type="button"
            onClick={handleToggleShift}
            className={`flex items-center space-x-2 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs cursor-pointer ${
              cash.status === 'open'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-900/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            {cash.status === 'open' ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Cerrar Turno de Caja</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Abrir Nuevo Turno</span>
              </>
            )}
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tarjeta de Sesión Activa */}
      <div className={`rock-card p-6 rounded-2xl border-l-4 space-y-4 ${
        cash.status === 'open' ? 'border-l-emerald-500' : 'border-l-red-600'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <span className={`p-2.5 rounded-xl ${
              cash.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {cash.status === 'open' ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-lg">
                  {cash.status === 'open' ? 'Turno Activo en Operación' : 'Turno Cerrado'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  cash.status === 'open'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {cash.status === 'open' ? 'Operando' : 'Cerrado'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Operador: <strong className="text-white">Cajero Principal</strong> • Inicio: {cash.openedAt}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-400 uppercase font-semibold">Efectivo Físico Esperado</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400">{formatCOP(cash.expectedCash)}</p>
          </div>
        </div>

        {/* Desglose de Caja en Vivo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div>
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Base Inicial</p>
            <p className="text-lg font-black text-white mt-1">{formatCOP(cash.initialCash)}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Ventas en Efectivo</p>
            <p className="text-lg font-black text-emerald-400 mt-1">{formatCOP(cash.cashSales)}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Nequi / Tarjetas</p>
            <p className="text-lg font-black text-blue-400 mt-1">{formatCOP(cash.electronicSales)}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Gastos / Retiros</p>
            <p className="text-lg font-black text-red-500 mt-1">-{formatCOP(cash.expenses)}</p>
          </div>
        </div>
      </div>

      {/* Registro de Gasto / Retiro y Movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Salida de Caja (5 cols) */}
        <div className="lg:col-span-5 rock-card p-5 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-white text-sm">Registrar Gasto o Salida Menor</h3>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Motivo o Justificación</label>
              <input
                type="text"
                required
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Ej. Compra hielo, limones, taxi..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Monto en COP ($)</label>
              <input
                type="number"
                required
                min={1}
                value={expenseAmount || ''}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                placeholder="Ej. 20000"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={cash.status !== 'open'}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/30 transition-all cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Descontar de Caja</span>
            </button>
          </form>
        </div>

        {/* Historial de Movimientos (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Historial de Movimientos ({movements.length})</h3>
          <div className="rock-card rounded-2xl overflow-hidden divide-y divide-zinc-800/80 max-h-80 overflow-y-auto">
            {movements.length === 0 ? (
              <p className="p-6 text-center text-xs text-zinc-500">No hay movimientos registrados.</p>
            ) : (
              movements.map((m: CashMovementRecord) => (
                <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
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
                      <p className="text-xs font-bold text-white">{m.description}</p>
                      <p className="text-[10px] text-zinc-500">
                        {m.time} • Por {m.user}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-black text-xs font-mono ${
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
    </div>
  )
}
