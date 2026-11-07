"use client"

import React, { useEffect, useSyncExternalStore, useRef, useCallback } from 'react'
import { dialogStore, ActiveDialogState } from '@/lib/dialogService'
import {
  AlertTriangle,
  Trash2,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react'

const EMPTY_STATE: ActiveDialogState = {
  isOpen: false,
  title: '',
  message: '',
  details: [],
  type: 'confirm',
  variant: 'warning',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  promptInput: '',
  promptPlaceholder: '',
  promptDefaultValue: '',
  badgeText: '',
}

export default function GlobalDialog() {
  const dialog = useSyncExternalStore(
    dialogStore.subscribe,
    dialogStore.getSnapshot,
    () => EMPTY_STATE
  )

  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleConfirm = useCallback(() => {
    if (dialog.type === 'prompt') {
      dialogStore.close(dialog.promptInput)
    } else {
      dialogStore.close(true)
    }
  }, [dialog.type, dialog.promptInput])

  const handleCancel = useCallback(() => {
    if (dialog.type === 'prompt') {
      dialogStore.close(null)
    } else {
      dialogStore.close(false)
    }
  }, [dialog.type])

  // Focus input automatically if prompt
  useEffect(() => {
    if (dialog.isOpen && dialog.type === 'prompt') {
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [dialog.isOpen, dialog.type])

  // Keyboard navigation: Escape closes, Enter submits
  useEffect(() => {
    if (!dialog.isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialog.isOpen, handleCancel, handleConfirm])

  if (!dialog.isOpen) return null

  const variantStyles = {
    warning: {
      glow: 'bg-amber-500/10 border-amber-500/30',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      iconBox: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      btnConfirm:
        'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-black font-extrabold shadow-lg shadow-amber-950/40',
    },
    danger: {
      glow: 'bg-red-500/10 border-red-500/30',
      badge: 'bg-red-500/15 text-red-300 border-red-500/40',
      iconBox: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: <Trash2 className="w-6 h-6 text-red-400" />,
      btnConfirm:
        'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold shadow-lg shadow-red-950/50',
    },
    info: {
      glow: 'bg-cyan-500/10 border-cyan-500/30',
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
      iconBox: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      icon: <Info className="w-6 h-6 text-cyan-400" />,
      btnConfirm:
        'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-950/40',
    },
    success: {
      glow: 'bg-emerald-500/10 border-emerald-500/30',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      iconBox: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      btnConfirm:
        'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-950/40',
    },
  }[dialog.variant || 'warning']

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={handleCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#0e131f] border border-zinc-800 shadow-2xl p-6 sm:p-7 relative overflow-hidden animate-scaleUp space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luz ambiental sutil en la cabecera */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full blur-3xl pointer-events-none ${variantStyles.glow}`}
        />

        {/* Encabezado con Icono, Badge e interruptor de cerrar */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${variantStyles.iconBox}`}
            >
              {variantStyles.icon}
            </div>

            <div>
              <span
                className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider mb-1 ${variantStyles.badge}`}
              >
                {dialog.badgeText || 'Aviso del Sistema'}
              </span>
              <p className="text-[11px] text-zinc-400 font-medium">Rock Bar POS • Sistema de Gestión</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Título Principal */}
        <div className="space-y-2 relative z-10">
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
            {dialog.title}
          </h3>

          {dialog.message && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {dialog.message}
            </p>
          )}
        </div>

        {/* Bloque de detalles con viñetas o checkmarks (ideal para garantías como 'Tus productos se conservan') */}
        {dialog.details && dialog.details.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 relative z-10">
            {dialog.details.map((detail, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-zinc-300 leading-snug">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        )}

        {/* Entrada para modo Prompt */}
        {dialog.type === 'prompt' && (
          <div className="space-y-1.5 relative z-10">
            <input
              ref={inputRef}
              type="text"
              value={dialog.promptInput}
              onChange={(e) => dialogStore.setPromptInput(e.target.value)}
              placeholder={dialog.promptPlaceholder}
              className="w-full bg-[#131926] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-zinc-800/80 relative z-10">
          {dialog.type !== 'alert' && dialog.cancelText && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              {dialog.cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${variantStyles.btnConfirm}`}
          >
            {dialog.confirmText || 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  )
}
