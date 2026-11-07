"use client"

export type DialogVariant = 'warning' | 'danger' | 'info' | 'success'
export type DialogType = 'confirm' | 'alert' | 'prompt'

export interface DialogOptions {
  title: string
  message?: string
  details?: string[]
  type?: DialogType
  variant?: DialogVariant
  confirmText?: string
  cancelText?: string
  promptPlaceholder?: string
  promptDefaultValue?: string
  badgeText?: string
}

export interface ActiveDialogState extends DialogOptions {
  isOpen: boolean
  promptInput: string
  resolve?: (value: unknown) => void
}

const DEFAULT_STATE: ActiveDialogState = {
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

let currentDialog: ActiveDialogState = { ...DEFAULT_STATE }
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export const dialogStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot(): ActiveDialogState {
    return currentDialog
  },
  setPromptInput(val: string) {
    currentDialog = { ...currentDialog, promptInput: val }
    emitChange()
  },
  close(value: unknown) {
    const resolver = currentDialog.resolve
    currentDialog = { ...DEFAULT_STATE, isOpen: false }
    emitChange()
    if (resolver) {
      resolver(value)
    }
  },
}

/**
 * Muestra un diálogo de confirmación personalizado (Reemplazo moderno de confirm())
 */
export function confirmAction(options: DialogOptions | string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const opts: DialogOptions =
      typeof options === 'string'
        ? { title: options, variant: 'warning' }
        : options

    currentDialog = {
      isOpen: true,
      title: opts.title,
      message: opts.message || '',
      details: opts.details || [],
      type: opts.type || 'confirm',
      variant: opts.variant || 'warning',
      confirmText: opts.confirmText || 'Aceptar',
      cancelText: opts.cancelText || 'Cancelar',
      promptInput: '',
      promptPlaceholder: opts.promptPlaceholder || '',
      promptDefaultValue: opts.promptDefaultValue || '',
      badgeText: opts.badgeText || (opts.variant === 'danger' ? 'Acción Irreversible' : 'Confirmación Requerida'),
      resolve: (val) => resolve(Boolean(val)),
    }
    emitChange()
  })
}

/**
 * Muestra un diálogo de aviso o alerta personalizado (Reemplazo moderno de alert())
 */
export function alertAction(options: DialogOptions | string): Promise<void> {
  return new Promise<void>((resolve) => {
    const opts: DialogOptions =
      typeof options === 'string'
        ? { title: options, variant: 'info' }
        : options

    currentDialog = {
      isOpen: true,
      title: opts.title,
      message: opts.message || '',
      details: opts.details || [],
      type: 'alert',
      variant: opts.variant || 'info',
      confirmText: opts.confirmText || 'Entendido',
      cancelText: '',
      promptInput: '',
      promptPlaceholder: '',
      promptDefaultValue: '',
      badgeText: opts.badgeText || 'Aviso del Sistema',
      resolve: () => resolve(),
    }
    emitChange()
  })
}

/**
 * Muestra un diálogo interactivo para solicitar un texto al usuario (Reemplazo moderno de prompt())
 */
export function promptAction(options: DialogOptions | string): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const opts: DialogOptions =
      typeof options === 'string'
        ? { title: options, variant: 'info' }
        : options

    currentDialog = {
      isOpen: true,
      title: opts.title,
      message: opts.message || '',
      details: opts.details || [],
      type: 'prompt',
      variant: opts.variant || 'info',
      confirmText: opts.confirmText || 'Guardar',
      cancelText: opts.cancelText || 'Cancelar',
      promptInput: opts.promptDefaultValue || '',
      promptPlaceholder: opts.promptPlaceholder || 'Escribe aquí...',
      promptDefaultValue: opts.promptDefaultValue || '',
      badgeText: opts.badgeText || 'Entrada Requerida',
      resolve: (val) => resolve(val !== null && val !== undefined ? String(val) : null),
    }
    emitChange()
  })
}
