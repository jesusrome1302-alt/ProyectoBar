"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Bell,
  ArrowRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  X,
  Plus,
} from 'lucide-react'
import { useBarStore, transferStockToNevera, adjustProductStock, ProductState } from '@/lib/barState'

// Síntesis Web Audio API para timbre sutil de barra (sin archivos de audio externos)
function playAlertChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    // Tono 1 (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)
    gain1.gain.setValueAtTime(0.12, now)
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Tono 2 (A5 - 880 Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12)
    gain2.gain.setValueAtTime(0.15, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.55)
  } catch {
    // Si el usuario no ha interactuado o el navegador bloquea audio, no hacer nada
  }
}

export default function NotificationCenter() {
  const barData = useBarStore()
  const products = barData.products || []
  const [isOpen, setIsOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem('rock_bar_notifications_sound')
      return saved !== null ? saved === 'true' : true
    } catch {
      return true
    }
  })
  const [actionFeedback, setActionFeedback] = useState<string>('')
  const menuRef = useRef<HTMLDivElement | null>(null)
  const previousAlertCount = useRef<number>(0)

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newVal = !soundEnabled
    setSoundEnabled(newVal)
    try {
      localStorage.setItem('rock_bar_notifications_sound', String(newVal))
    } catch {
      // Ignorar
    }
    if (newVal) {
      playAlertChime()
    }
  }

  // Filtrar productos con nevera baja (stock en nevera <= mínimo de reposición)
  const lowNeveraProducts = products.filter((p) => {
    const stockNevera = p.stock_nevera ?? p.stock ?? 0
    const minNevera = p.min_stock_nevera ?? Math.max(2, Math.floor((p.min_stock || 10) / 2))
    return stockNevera <= minNevera
  })

  // Filtrar productos con bodega baja o sin existencias de reserva
  const lowBodegaProducts = products.filter((p) => {
    const stockBodega = p.stock_bodega ?? 0
    const minNevera = p.min_stock_nevera ?? Math.max(2, Math.floor((p.min_stock || 10) / 2))
    const minBodega = Math.max(1, (p.min_stock || 10) - minNevera)
    const total = p.stock ?? 0
    return stockBodega <= 0 || stockBodega <= minBodega || total <= (p.min_stock || 10)
  })

  const totalAlerts = lowNeveraProducts.length + lowBodegaProducts.length

  // Si la cantidad de alertas de nevera o bodega aumenta durante el servicio, reproducir el timbre
  useEffect(() => {
    if (totalAlerts > previousAlertCount.current) {
      if (soundEnabled) {
        playAlertChime()
      }
    }
    previousAlertCount.current = totalAlerts
  }, [totalAlerts, soundEnabled])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Transferir rápido +6 de bodega a nevera directamente desde la notificación
  const handleQuickTransfer = (p: ProductState, qty = 6) => {
    const bodega = p.stock_bodega ?? 0
    if (bodega <= 0) return
    const amount = Math.min(qty, bodega)
    const ok = transferStockToNevera(p.id, amount)
    if (ok) {
      setActionFeedback(`❄️ +${amount} ${p.name} pasadas a nevera.`)
      setTimeout(() => setActionFeedback(''), 3000)
    }
  }

  // Agregar rápido +12 unidades a Bodega desde la notificación
  const handleQuickAddBodega = (p: ProductState, qty = 12) => {
    adjustProductStock(p.id, qty, 'bodega', `Reabastecimiento rápido de Bodega (+${qty} uds)`)
    setActionFeedback(`📦 +${qty} ${p.name} agregadas a Bodega.`)
    setTimeout(() => setActionFeedback(''), 3000)
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón de la Campana */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones y Alertas de Inventario"
        title={
          totalAlerts > 0
            ? `${totalAlerts} alertas de existencias activas (Nevera / Bodega)`
            : 'Sin alertas pendientes • Neveras y almacén en orden'
        }
        className={`p-2 rounded-xl transition-all relative cursor-pointer ${
          totalAlerts > 0
            ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 shadow-sm shadow-amber-950/40'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
        }`}
      >
        <Bell className={`w-5 h-5 ${totalAlerts > 0 ? 'animate-bellRing' : ''}`} />

        {/* Badge numérico pulsante */}
        {totalAlerts > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-600 border border-red-400 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-lg shadow-red-950/80 animate-pulse">
            {totalAlerts > 99 ? '99+' : totalAlerts}
          </span>
        )}
      </button>

      {/* Menú Dropdown Flotante */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0e131f] border border-zinc-800 shadow-2xl p-4 z-50 animate-scaleUp space-y-3">
          {/* Cabecera del Panel de Notificaciones */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Alertas del Bar
                </h4>
                <p className="text-[10px] text-zinc-400">
                  {totalAlerts === 0
                    ? 'Todo en orden'
                    : `${totalAlerts} ${totalAlerts === 1 ? 'alerta activa' : 'alertas activas'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={toggleSound}
                title={soundEnabled ? 'Silenciar timbre de barra' : 'Activar timbre de barra'}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feedback de Acción Rápida */}
          {actionFeedback && (
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Lista de Alertas */}
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {totalAlerts === 0 ? (
              <div className="text-center py-6 px-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-zinc-200">
                  ¡Neveras y Almacén en Orden!
                </p>
                <p className="text-[11px] text-zinc-400">
                  Todas las bebidas frías y existencias se encuentran por encima del mínimo requerido.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Alertas de Nevera Baja */}
                {lowNeveraProducts.map((p) => {
                  const nevera = p.stock_nevera ?? p.stock ?? 0
                  const bodega = p.stock_bodega ?? 0
                  const minNevera = p.min_stock_nevera ?? 4

                  return (
                    <div
                      key={'nevera-' + p.id}
                      className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-sky-950/20 to-zinc-900 border border-cyan-500/30 hover:border-cyan-400/60 transition-all space-y-2 relative overflow-hidden group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs shrink-0">
                            ❄️
                          </span>
                          <div className="truncate">
                            <p className="text-xs font-black text-white truncate">{p.name}</p>
                            <p className="text-[10px] text-cyan-300 font-medium">
                              {nevera === 0 ? '¡NEVERA VACÍA! (0 uds)' : `${nevera} uds frías (Mín: ${minNevera})`}
                            </p>
                          </div>
                        </div>

                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 shrink-0">
                          Enfriar
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-cyan-950/60 text-[10px]">
                        <span className="text-zinc-400">
                          En bodega: <strong className="text-amber-300">{bodega} uds</strong>
                        </span>

                        {bodega > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleQuickTransfer(p, 6)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] flex items-center space-x-1 shadow transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Pasar +{Math.min(6, bodega)} a Nevera</span>
                          </button>
                        ) : (
                          <Link
                            href="/productos"
                            onClick={() => setIsOpen(false)}
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                          >
                            <span>Pedir a Proveedor</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* 2. Alertas de Bodega Baja o Sin Reserva */}
                {lowBodegaProducts.map((p) => {
                  const bodega = p.stock_bodega ?? 0
                  const nevera = p.stock_nevera ?? p.stock ?? 0
                  const minNevera = p.min_stock_nevera ?? Math.max(2, Math.floor((p.min_stock || 10) / 2))
                  const minBodega = Math.max(1, (p.min_stock || 10) - minNevera)

                  return (
                    <div
                      key={'bodega-' + p.id}
                      className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-zinc-900 border border-amber-500/30 hover:border-amber-400/60 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs shrink-0">
                            📦
                          </span>
                          <div className="truncate">
                            <p className="text-xs font-black text-white truncate">{p.name}</p>
                            <p className="text-[10px] text-amber-300 font-medium">
                              {bodega <= 0
                                ? '¡BODEGA VACÍA! (0 uds en reserva)'
                                : `Bodega baja: ${bodega} uds (Mín: ${minBodega})`}
                            </p>
                          </div>
                        </div>

                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0">
                          {bodega <= 0 ? 'Sin Reserva' : 'Comprar'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-amber-950/60 text-[10px]">
                        <span className="text-zinc-400">
                          En nevera: <strong className="text-cyan-300">{nevera} uds</strong>
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleQuickAddBodega(p, 12)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-extrabold text-[10px] flex items-center space-x-1 shadow transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+12 a Bodega</span>
                          </button>

                          <Link
                            href="/productos"
                            onClick={() => setIsOpen(false)}
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-0.5"
                          >
                            <span>Compras</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          {/* Pie del Panel */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
            <Link
              href="/productos"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>Ver Inventario Completo</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <span className="text-[10px] text-zinc-400 font-mono">
              Rock Bar POS
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
