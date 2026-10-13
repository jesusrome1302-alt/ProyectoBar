import { Settings, Building2, Sliders, Save } from 'lucide-react'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
            <Settings className="w-4 h-4" />
            <span>Sistema & Parámetros</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Configuración del Establecimiento
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Ajustes de datos del bar, parámetros de mesas, moneda y seguridad.
          </p>
        </div>

        <button className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm">
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Negocio */}
        <div className="rock-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-zinc-800">
            <Building2 className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-white text-base">Datos del Negocio</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Nombre Comercial</label>
              <input
                type="text"
                defaultValue="ROCK BAR"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">NIT o Identificación Tributaria</label>
              <input
                type="text"
                defaultValue="900.123.456-7"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Texto al pie de la cuenta / comanda</label>
              <textarea
                rows={2}
                defaultValue="¡Gracias por tu visita a Rock Bar! El rock nunca muere."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Parámetros Operativos */}
        <div className="rock-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-zinc-800">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white text-base">Parámetros Operativos</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Moneda Principal</label>
              <input
                type="text"
                readOnly
                value="COP ($ - Pesos Colombianos)"
                className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Cantidad de Mesas Habilitadas</label>
              <input
                type="number"
                defaultValue={9}
                min={1}
                max={20}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Porcentaje de Impoconsumo / IVA (%)</label>
              <input
                type="number"
                defaultValue={8}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
