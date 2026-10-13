'use client'

import { useState } from 'react'
import { UtensilsCrossed, Plus, Users, Clock, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useBarStore, loadBarData, saveBarData, resetBarData, setActiveTableId, TableState } from '@/lib/barState'

export default function MesasPage() {
  const barData = useBarStore()
  const tables = barData.tables
  const [selectedTableId, setSelectedTableId] = useState<number>(1)
  const [successMsg, setSuccessMsg] = useState<string>('')

  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')

  // Abrir una mesa disponible
  const handleOpenTable = (id: number) => {
    const data = loadBarData()
    const now = new Date()
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    const updated = data.tables.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: 'occupied' as const,
          openedAt: timeStr,
          items: [],
          payments: [],
          total: 0,
          paid: 0,
          pending: 0,
        }
      }
      return t
    })

    data.tables = updated
    saveBarData(data)
    setSelectedTableId(id)
    setSuccessMsg(`¡Mesa ${id} abierta con éxito! Ya puedes tomar pedidos.`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Cambiar estado a reservada o disponible
  const handleChangeStatus = (id: number, status: 'available' | 'occupied' | 'reserved') => {
    const data = loadBarData()
    const updated = data.tables.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status,
          openedAt: status === 'occupied' ? t.openedAt || 'Ahora' : undefined,
          items: status === 'available' ? [] : t.items,
          payments: status === 'available' ? [] : t.payments,
          total: status === 'available' ? 0 : t.total,
          paid: status === 'available' ? 0 : t.paid,
          pending: status === 'available' ? 0 : t.pending,
        }
      }
      return t
    })

    data.tables = updated
    saveBarData(data)
    setSelectedTableId(id)
    setSuccessMsg(`Estado de Mesa ${id} actualizado a "${status === 'available' ? 'Disponible' : status === 'reserved' ? 'Reservada' : 'Ocupada'}".`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleResetData = () => {
    if (confirm('¿Deseas reiniciar los datos de prueba al estado inicial?')) {
      resetBarData()
      setSuccessMsg('Datos de prueba reiniciados al estado por defecto.')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length
  const availableCount = tables.filter((t) => t.status === 'available').length
  const reservedCount = tables.filter((t) => t.status === 'reserved').length

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Salón & Barra • Operador Único</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Control de Mesas (1 al 9)
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Haz clic en cualquier mesa para abrirla, cambiar su estado, tomar pedidos o proceder a cobrar.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetData}
            title="Reiniciar datos de prueba"
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar Datos</span>
          </button>
          <Link
            href="/ventas"
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Punto de Venta</span>
          </Link>
        </div>
      </div>

      {/* Notificación de Éxito */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

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
        {tables.map((t: TableState) => {
          const isOccupied = t.status === 'occupied'
          const isReserved = t.status === 'reserved'
          const isSelected = selectedTableId === t.id

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTableId(t.id)}
              className={`rock-card p-5 rounded-2xl transition-all border-2 flex flex-col justify-between cursor-pointer ${
                isSelected ? 'ring-2 ring-red-500 shadow-xl shadow-red-900/20' : ''
              } ${
                isOccupied
                  ? 'border-red-600/70 bg-zinc-900/90'
                  : isReserved
                  ? 'border-amber-500/70 bg-zinc-900/90'
                  : 'border-emerald-500/40 bg-zinc-900/50 hover:border-emerald-500'
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

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 my-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Consumo actual:</span>
                    <span className="font-black text-white text-sm">{formatCOP(t.total)}</span>
                  </div>
                  {isOccupied && (
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                      <span>{t.items.length} ítems consumidos</span>
                      <span className="flex items-center text-amber-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {t.openedAt || 'Activa'}
                      </span>
                    </div>
                  )}
                  {isOccupied && t.paid > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 mt-1 border-t border-zinc-900 pt-1">
                      <span>Abonado: {formatCOP(t.paid)}</span>
                      <span>Saldo: {formatCOP(t.pending)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción Interactivos */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                {isOccupied ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/ventas"
                      onClick={() => setActiveTableId(t.id)}
                      className="flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                      <span>+ Pedido</span>
                    </Link>
                    <Link
                      href="/cobro"
                      className="flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/30 transition-colors"
                    >
                      <span>Cobrar</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : isReserved ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenTable(t.id)
                      }}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                    >
                      Ocupar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleChangeStatus(t.id, 'available')
                      }}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      Liberar
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenTable(t.id)
                      }}
                      className="w-full flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/20 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Abrir Mesa</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleChangeStatus(t.id, 'reserved')
                      }}
                      className="w-full py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-amber-400 bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
                    >
                      Reservar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
