"use client"

import { useState, useRef } from 'react'
import { Camera, Upload, Trash2, X, Check, Sparkles, Image as ImageIcon } from 'lucide-react'
import { processImageFile } from '@/lib/imageUtils'
import { updateUserPhoto, useAuthStore } from '@/lib/authStore'
import { updateBarLogo, useBarStore } from '@/lib/barState'

interface PhotoUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PhotoUploadModal({ isOpen, onClose }: PhotoUploadModalProps) {
  const { user } = useAuthStore()
  const barData = useBarStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentPhoto = user?.photoUrl || barData.settings?.logoUrl || ''
  const [preview, setPreview] = useState<string>(currentPhoto)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  if (!isOpen) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setIsProcessing(true)
    try {
      const optimized = await processImageFile(file, 400, 400, 0.85)
      setPreview(optimized)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la imagen'
      setError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = () => {
    try {
      // 1. Guardar en el perfil del usuario activo
      updateUserPhoto(preview)
      // 2. Guardar en la configuración visual del bar (sincroniza en la nube)
      updateBarLogo(preview)

      setSuccess('¡Foto del bar actualizada con éxito!')
      setTimeout(() => {
        setSuccess('')
        onClose()
      }, 1000)
    } catch (err: unknown) {
      console.error(err)
      setError('Error al guardar la foto. Intenta de nuevo.')
    }
  }

  const handleRemovePhoto = () => {
    setPreview('')
    setError('')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JA'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
        {/* Cabecera Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600/20 to-red-600/20 text-amber-500 border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Foto o Logo del Bar</h3>
              <p className="text-xs text-zinc-400">Personaliza la imagen que identifica tu establecimiento</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes de feedback */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Vista previa de la foto */}
        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center overflow-hidden shadow-2xl relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-3xl font-black text-white">
                  {initials}
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg cursor-pointer transition-transform hover:scale-110"
              title="Cambiar imagen"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-zinc-200">
              {user?.barName || barData.settings?.barName || 'Tu Bar'}
            </p>
            <p className="text-[11px] text-zinc-500">
              Esta foto se mostrará en el perfil superior, menú lateral y tickets.
            </p>
          </div>
        </div>

        {/* Input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />

        {/* Opciones de carga */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>Seleccionar Imagen desde mi Portátil</span>
          </button>

          {preview && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="w-full py-2 px-4 rounded-xl text-zinc-500 hover:text-red-400 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Quitar foto y usar iniciales</span>
            </button>
          )}
        </div>

        {/* Acciones */}
        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Guardar Foto</span>
          </button>
        </div>
      </div>
    </div>
  )
}
