'use client'

import { useState } from 'react'
import { ReceiptText, CreditCard, DollarSign, Smartphone, Landmark, CheckCircle, AlertCircle, Printer, Check } from 'lucide-react'
import Link from 'next/link'
import { useBarStore, loadBarData, saveBarData, TableState, PaymentRecord } from '@/lib/barState'

export default function CobroPage() {
  const barData = useBarStore()
  const tables = barData.tables
  const [selectedTableId, setSelectedTableId] = useState<number>(3)
  const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo')
  const [customAmount, setCustomAmount] = useState<number | null>(null)
  const [cashReceived, setCashReceived] = useState<number>(50000)
  const [notification, setNotification] = useState<string>('')

  const currentAccount = tables.find((t: TableState) => t.id === selectedTableId) || tables[0]

  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')

  const effectiveAmount = customAmount !== null ? customAmount : (currentAccount?.pending ?? 0)

  // Registrar pago o abono
  const handleRegisterPayment = () => {
    if (!currentAccount || effectiveAmount <= 0) return

    const data = loadBarData()
    const now = new Date()
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    const paymentRecord: PaymentRecord = {
      id: 'pay-' + Date.now(),
      method: paymentMethod,
      amount: effectiveAmount,
      timestamp: timeStr,
      operator: data.operatorName,
    }

    // Actualizar mesa
    let newPending = 0
    const updatedTables = data.tables.map((t) => {
      if (t.id === selectedTableId) {
        const newPaid = (t.paid || 0) + effectiveAmount
        newPending = Math.max(0, (t.total || 0) - newPaid)
        return {
          ...t,
          paid: newPaid,
          pending: newPending,
          payments: [...(t.payments || []), paymentRecord],
        }
      }
      return t
    })

    // Actualizar caja según método de pago
    if (paymentMethod === 'Efectivo') {
      data.cash.cashSales += effectiveAmount
      data.cash.expectedCash += effectiveAmount
      data.movements.unshift({
        id: 'mov-' + Date.now(),
        type: 'sale',
        description: `Pago en efectivo ${currentAccount.name}`,
        amount: effectiveAmount,
        time: timeStr,
        user: data.operatorName,
      })
    } else {
      data.cash.electronicSales += effectiveAmount
      data.movements.unshift({
        id: 'mov-' + Date.now(),
        type: 'sale',
        description: `Pago ${paymentMethod} ${currentAccount.name}`,
        amount: effectiveAmount,
        time: timeStr,
        user: data.operatorName,
      })
    }

    data.tables = updatedTables
    saveBarData(data)
    setCustomAmount(null)
    setNotification(`¡Pago de ${formatCOP(effectiveAmount)} con ${paymentMethod} registrado para ${currentAccount.name}!`)
    setTimeout(() => setNotification(''), 4500)
  }

  // Cerrar cuenta y liberar mesa (cuando saldo = $0)
  const handleCloseAndFreeTable = () => {
    if (!currentAccount || currentAccount.pending > 0) return

    const data = loadBarData()
    const updatedTables = data.tables.map((t) => {
      if (t.id === selectedTableId) {
        return {
          ...t,
          status: 'available' as const,
          items: [],
          payments: [],
          total: 0,
          paid: 0,
          pending: 0,
          openedAt: undefined,
        }
      }
      return t
    })

    data.tables = updatedTables
    saveBarData(data)
    setCustomAmount(null)
    setNotification(`¡Cuenta cerrada y ${currentAccount.name} liberada exitosamente! Ahora está Disponible.`)
    setTimeout(() => setNotification(''), 5000)
  }

  const changeDue = Math.max(0, cashReceived - effectiveAmount)

  // Cuentas con consumo o activas
  const activeTables = tables.filter((t: TableState) => t.status === 'occupied' || t.total > 0)

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <ReceiptText className="w-4 h-4" />
            <span>Módulo de Facturación & Cobros • Operador Único</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cuentas, Cobros & Cierre
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Selecciona la mesa a cobrar, ingresa pagos totales o abonos parciales y cierra la cuenta al quedar en saldo $0.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/ventas"
            className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold px-3.5 py-2 rounded-xl transition-all text-xs"
          >
            <span>+ Tomar Pedido</span>
          </Link>
          <Link
            href="/mesas"
            className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold px-3.5 py-2 rounded-xl transition-all text-xs"
          >
            <span>Ver Mesas</span>
          </Link>
        </div>
      </div>

      {/* Notificación si existe */}
      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid Principal: Lista de Cuentas Abiertas (izq) y Panel de Cobro Detallado (der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Selector de Cuentas Abiertas (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cuentas por Cobrar</h3>
            <span className="text-xs bg-zinc-800 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-zinc-700">
              {activeTables.length} mesas activas
            </span>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {activeTables.length === 0 ? (
              <div className="rock-card p-6 rounded-2xl text-center text-zinc-500 text-xs">
                No hay mesas ocupadas en este momento.
                <div className="mt-2">
                  <Link href="/mesas" className="text-amber-400 font-bold underline">
                    Abrir una mesa en el salón
                  </Link>
                </div>
              </div>
            ) : (
              activeTables.map((acc: TableState) => {
                const isSelected = acc.id === selectedTableId
                const isSettled = acc.total > 0 && acc.pending === 0

                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedTableId(acc.id)
                      setCustomAmount(null)
                    }}
                    className={`rock-card p-4 rounded-2xl transition-all cursor-pointer border-l-4 ${
                      isSelected
                        ? 'border-l-red-600 bg-zinc-900 shadow-lg shadow-red-900/10 ring-1 ring-red-500'
                        : isSettled
                        ? 'border-l-emerald-500 hover:border-l-emerald-400'
                        : 'border-l-amber-500 hover:border-l-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-base">{acc.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isSettled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : acc.paid > 0
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {isSettled ? 'Saldada ($0)' : acc.paid > 0 ? 'Con Abonos' : 'Pendiente'}
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
              })
            )}
          </div>
        </div>

        {/* Panel de Cobro y Liquidación (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {currentAccount ? (
            <div className="rock-card p-6 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-black text-xl text-white">{currentAccount.name}</h3>
                    <span className="text-xs bg-red-600/20 text-red-400 px-2.5 py-0.5 rounded-full font-bold border border-red-600/30">
                      {currentAccount.status === 'occupied' ? 'Ocupada' : 'Disponible'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Operador: <strong className="text-white">Cajero Principal</strong> • {currentAccount.openedAt || 'Hoy'}
                  </p>
                </div>

                {/* Indicadores Financieros de la Cuenta */}
                <div className="flex items-center space-x-4 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Total Cuenta</p>
                    <p className="text-sm font-black text-white">{formatCOP(currentAccount.total)}</p>
                  </div>
                  <div className="border-l border-zinc-800 pl-4">
                    <p className="text-[10px] text-emerald-400 uppercase font-bold">Abonado</p>
                    <p className="text-sm font-black text-emerald-400">{formatCOP(currentAccount.paid)}</p>
                  </div>
                  <div className="border-l border-zinc-800 pl-4">
                    <p className="text-[10px] text-amber-500 uppercase font-bold">Saldo Pendiente</p>
                    <p className="text-base font-black text-amber-400">{formatCOP(currentAccount.pending)}</p>
                  </div>
                </div>
              </div>

              {/* Consumo y Abonos en 2 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Detalle de Artículos */}
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Artículos ({currentAccount.items?.length || 0})
                  </p>
                  {!currentAccount.items || currentAccount.items.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-4 text-center">No hay artículos registrados.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {currentAccount.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-zinc-900 last:border-0">
                          <div>
                            <p className="font-bold text-white">{it.name}</p>
                            <p className="text-[10px] text-zinc-500">{it.quantity} x {formatCOP(it.unitPrice)}</p>
                          </div>
                          <span className="font-black text-zinc-200">{formatCOP(it.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Historial de Pagos / Abonos Registrados */}
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Abonos Realizados</p>
                  {!currentAccount.payments || currentAccount.payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-28 text-center text-zinc-500">
                      <AlertCircle className="w-5 h-5 mb-1 opacity-50" />
                      <p className="text-xs">No hay abonos registrados aún en esta mesa.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {currentAccount.payments.map((pay) => (
                        <div key={pay.id} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <div>
                              <p className="font-bold text-white">{pay.method}</p>
                              <p className="text-[10px] text-zinc-500">{pay.timestamp} • Por {pay.operator}</p>
                            </div>
                          </div>
                          <span className="font-black text-emerald-400">+{formatCOP(pay.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Módulo de Registro de Pago */}
              <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-red-500" />
                    <span>Registrar Pago / Abono</span>
                  </h4>
                  <span className="text-xs text-zinc-400">
                    Saldo por Cobrar: <strong className="text-amber-400 font-bold">{formatCOP(currentAccount.pending)}</strong>
                  </span>
                </div>

                {/* Selector de Método de Pago */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Efectivo', icon: DollarSign, color: 'text-emerald-400' },
                    { id: 'Nequi / Daviplata', icon: Smartphone, color: 'text-purple-400' },
                    { id: 'Tarjeta Débito/Crédito', icon: CreditCard, color: 'text-blue-400' },
                    { id: 'Transferencia Bancaria', icon: Landmark, color: 'text-amber-400' },
                  ].map((m) => {
                    const Icon = m.icon
                    const isSelected = paymentMethod === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold space-y-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-red-600 bg-red-600/20 text-white shadow-md shadow-red-900/20'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${m.color}`} />
                        <span>{m.id}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Monto a Cobrar y Calculadora de Cambio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Monto a Abonar (COP)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">$</span>
                      <input
                        type="number"
                        value={effectiveAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-base font-black text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setCustomAmount(currentAccount.pending)}
                        className="text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1 rounded-md cursor-pointer"
                      >
                        Pagar Saldo ({formatCOP(currentAccount.pending)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomAmount(20000)}
                        className="text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1 rounded-md cursor-pointer"
                      >
                        $ 20.000
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomAmount(50000)}
                        className="text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1 rounded-md cursor-pointer"
                      >
                        $ 50.000
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'Efectivo' ? (
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Efectivo Recibido (Cálculo de Cambio)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">$</span>
                        <input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-base font-black text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <p className="text-xs text-zinc-400 mt-2">
                        Cambio / Vueltos al cliente:{' '}
                        <strong className="text-emerald-400 font-black">{formatCOP(changeDue)}</strong>
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 text-xs">
                      <p className="font-bold text-zinc-300 mb-1">Pago Electrónico ({paymentMethod})</p>
                      <p className="text-zinc-500 text-[11px]">
                        Verifica el comprobante en tu pantalla o comprobante del datáfono antes de confirmar.
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleRegisterPayment}
                    disabled={effectiveAmount <= 0}
                    className={`flex items-center justify-center space-x-2 font-bold py-3 rounded-xl transition-all text-sm ${
                      effectiveAmount > 0
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-900/30 cursor-pointer active:scale-95'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirmar Pago de {formatCOP(effectiveAmount)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseAndFreeTable}
                    disabled={currentAccount.pending > 0}
                    className={`flex items-center justify-center space-x-2 font-bold py-3 rounded-xl transition-all text-sm ${
                      currentAccount.pending === 0
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/40'
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                    <span>
                      {currentAccount.pending === 0
                        ? 'Cerrar Cuenta y Liberar Mesa'
                        : 'Pendiente saldo para cerrar'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rock-card p-8 rounded-2xl text-center text-zinc-500">
              Selecciona una cuenta a la izquierda para ver el detalle y registrar pagos.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
