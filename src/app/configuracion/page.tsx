'use client'

import { useState } from 'react'
import {
  Settings,
  Building2,
  Sliders,
  Save,
  Check,
  RefreshCw,
  AlertTriangle,
  User,
  X,
  Sparkles,
} from 'lucide-react'
import {
  useBarStore,
  loadBarData,
  saveBarData,
  updateBarSettings,
  clearOperationalDataOnly,
} from '@/lib/barState'

export default function ConfiguracionPage() {
  const barData = useBarStore()
  const settings = barData.settings || {
    barName: 'ROCK BAR',
    nit: '900.123.456-7',
    address: 'Calle 10 # 40-20, Medellín',
    phone: '+57 (4) 444-1234',
    footerText: '¡Gracias por tu visita a Rock Bar! El rock nunca muere.',
    tipPercentage: 10,
    taxPercentage: 8,
  }

  const [barName, setBarName] = useState<string>(settings.barName || 'ROCK BAR')
  const [nit, setNit] = useState<string>(settings.nit || '900.123.456-7')
  const [address, setAddress] = useState<string>(settings.address || 'Calle 10 # 40-20, Medellín')
  const [phone, setPhone] = useState<string>(settings.phone || '+57 (4) 444-1234')
  const [footerText, setFooterText] = useState<string>(
    settings.footerText || '¡Gracias por tu visita a Rock Bar! El rock nunca muere.'
  )
  const [operatorName, setOperatorName] = useState<string>(barData.operatorName || 'Cajero Principal')
  const [tipPercentage, setTipPercentage] = useState<number>(settings.tipPercentage || 10)
  const [taxPercentage, setTaxPercentage] = useState<number>(settings.taxPercentage || 8)

  const [notification, setNotification] = useState<string>('')
  const [showResetModal, setShowResetModal] = useState<boolean>(false)

  // Guardar configuración general
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()

    updateBarSettings({
      barName: barName.trim(),
      nit: nit.trim(),
      address: address.trim(),
      phone: phone.trim(),
      footerText: footerText.trim(),
      tipPercentage,
      taxPercentage,
    })

    const data = loadBarData()
    data.operatorName = operatorName.trim() || 'Cajero Principal'
    saveBarData(data)

    setNotification('¡Configuración del establecimiento guardada con éxito!')
    setTimeout(() => setNotification(''), 4000)
  }

  // Limpiar operaciones de prueba para la noche
  const handleConfirmReset = () => {
    clearOperationalDataOnly()
    setShowResetModal(false)
    setNotification('¡Mesas y movimientos de prueba reseteados a cero! Catálogo y stock conservados.')
    setTimeout(() => setNotification(''), 5000)
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
            <Settings className="w-4 h-4 text-amber-500" />
            <span>Sistema & Parámetros • Operador Único</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Configuración del Establecimiento
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Ajusta los datos fiscales del bar, mensajes del ticket térmico, operador activo y preparación de turno.
          </p>
        </div>

        {/* Notificación Toast reactiva */}
        {notification && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Negocio */}
          <div className="rock-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-zinc-800">
              <Building2 className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white text-base">Datos del Negocio & Tickets</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Nombre Comercial del Bar *</label>
                <input
                  type="text"
                  required
                  value={barName}
                  onChange={(e) => setBarName(e.target.value)}
                  placeholder="Ej. ROCK BAR MEDELLÍN"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">NIT / Identificación</label>
                  <input
                    type="text"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    placeholder="900.123.456-7"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 (4) 444-1234"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Dirección del Local</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle 10 # 40-20, Zona Rosa"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Mensaje al pie del ticket / recibo térmico
                </label>
                <textarea
                  rows={2}
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="¡Gracias por tu visita a Rock Bar! El rock nunca muere."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Parámetros Operativos */}
          <div className="rock-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-zinc-800">
              <Sliders className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-white text-base">Parámetros Operativos & Cajero</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Nombre del Operador en Turno *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">
                  Aparece en tickets, comandas y comprobantes de arqueo
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Moneda Principal</label>
                <input
                  type="text"
                  readOnly
                  value="COP ($ - Pesos Colombianos)"
                  className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Propina Sugerida (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={tipPercentage}
                    onChange={(e) => setTipPercentage(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Impoconsumo / IVA (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={19}
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Mesas Activas en el Salón</label>
                <input
                  type="text"
                  readOnly
                  value={`${barData.tables?.length || 0} Mesas / Cuentas Registradas (Dinámicas)`}
                  className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Inferiores */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-zinc-800">
          {/* Botón para Limpiar Pruebas */}
          <div>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center space-x-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Preparar Bar para Turno de Hoy (Limpiar Pruebas)</span>
            </button>
            <p className="text-[11px] text-zinc-500 mt-1">
              Deja las mesas y cuentas en $0 sin borrar tus productos ni inventario.
            </p>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE PREPARACIÓN DE TURNO */}
      {/* ========================================================================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-amber-500/40 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Preparar Turno de Esta Noche</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <p>
                Esta acción te permite <strong>iniciar el turno con el bar 100% limpio</strong>:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-zinc-400">
                <li>Libera las 9 mesas a estado <em>Disponible</em> con saldo $0.</li>
                <li>Limpia comandas de prueba acumuladas.</li>
                <li>Reinicia las ventas del día para el nuevo arqueo de caja.</li>
                <li>
                  <strong className="text-emerald-400">Conserva intacto</strong> todo tu catálogo de productos, existencias en bodega y proveedores.
                </li>
              </ul>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Ideal antes de abrir las puertas al público esta noche.</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
              >
                Sí, Preparar Turno en Limpio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
