"use client"

import { DollarSign, BarChart3, Zap, Calendar } from 'lucide-react'
import { useState } from 'react'

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState<string>('2026-10-01')
  const [fechaFin, setFechaFin] = useState<string>('2026-10-31')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ventas' | 'caja' | 'productos'>('todos')

  const reportesData = [
    {
      id: 1,
      tipo: 'venta',
      titulo: 'Ventas del Mes',
      valor: '$ 1,245,600',
      variacion: '+12.5%',
      icon: DollarSign,
      tiempo: 'Oct 2026',
      subtitulo: 'Comparado con septiembre',
    },
    {
      id: 2,
      tipo: 'mesa',
      titulo: 'Mesas Ocupadas',
      valor: '67%',
      variacion: '+8.3%',
      icon: BarChart3,
      tiempo: 'Turno actual',
      subtitulo: 'Promedio de ocupación',
    },
    {
      id: 3,
      tipo: 'producto',
      titulo: 'Productos Más Vendidos',
      valor: '1.248 unidades',
      variacion: '+24.1%',
      icon: BarChart3,
      tiempo: 'Ultima semana',
      subtitulo: 'Top 5 de productos',
    },
    {
      id: 4,
      tipo: 'caja',
      titulo: 'Resumen de Caja',
      valor: '$ 89,500',
      variacion: '-3.2%',
      icon: Zap,
      tiempo: 'Ultimo turnover',
      subtitulo: 'Efectivo vs. Tarjetas',
    },
  ]

  const ventasMensuales = [
    { mes: 'Sep', ventas: 980000 },
    { mes: 'Oct', ventas: 1245600 },
    { mes: 'Nov', ventas: 1100000 },
    { mes: 'Dic', ventas: 950000 },
  ]

  return (
    <div className="space-y-8">
      {/* Header del módulo de reportes */}
      <div className="relative overflow-hidden rounded-3xl rock-gradient p-6 sm:p-8 border border-red-900/40 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-red-600/30 border border-red-500/40 px-3 py-1 rounded-full text-amber-400 text-xs font-semibold mb-4">
            <span>📊 Reportes</span>
            <span>•</span>
            <span>Rock Bar POS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Módulo de Reportes
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base">
            Información operativa y financiera del negocio. Usa los filtros para narrowing down.
          </p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {reportesData.map((report) => {
          const Icon = report.icon
          return (
            <div key={report.id} className="rock-card p-6 rounded-2xl shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{report.tipo}</p>
                  <p className="text-2xl font-black text-white mt-1">{report.valor}</p>
                </div>
                <div className={`p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-zinc-400">
                <span className="text-emerald-400 font-bold mr-1.5 flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-0.5" /> {report.variacion}
                </span>
                <span>{report.tiempo}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filtros */}
      <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800/60 mb-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">FechaInicio</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded border border-zinc-700 background-zinc-900 text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">FechaFin</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded border border-zinc-700 background-zinc-900 text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'ventas' | 'caja' | 'productos')}
              className="w-full pl-4 py-2 rounded border border-zinc-700 background-zinc-900 text-zinc-100"
            >
              <option value="todos">Todos</option>
              <option value="ventas">Ventas</option>
              <option value="caja">Caja</option>
              <option value="productos">Productos</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Usuario</label>
            <select
              value=""
              onChange={() => {}}
              className="w-full pl-4 py-2 rounded border border-zinc-700 background-zinc-900 text-zinc-100"
            >
              <option value="">Todos</option>
              <option value="admin">Administrador</option>
              <option value="staff">Empleado</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => alert('Generando reporte...')}
          className="w-full py-2 rounded border border-amber-500 bg-amber-500/10 text-amber-400 font-medium uppercase tracking-wider hover:bg-amber-600/20 transition-colors"
        >
          Generar Reporte CSV
        </button>
      </div>

      {/* Gráficos y tablas de datos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ventas Mensuales */}
        <div className="rock-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-white tracking-wide mb-4">Ventas Mensuales</h3>
          <div className="h-64 bg-zinc-950 rounded-xl p-4 flex flex-col justify-end space-y-2">
            <div className="flex items-end justify-between h-44 pt-4 px-2">
              {ventasMensuales.map((vm) => (
                <div key={vm.mes} className="flex flex-col items-center flex-1 space-y-1">
                  <span className="text-[10px] text-zinc-400">${(vm.ventas / 1000).toFixed(0)}k</span>
                  <div
                    className="w-8 bg-gradient-to-t from-red-600 to-amber-500 rounded-t-md transition-all hover:brightness-125"
                    style={{ height: `${(vm.ventas / 1300000) * 100}%` }}
                  />
                  <span className="text-xs font-semibold text-zinc-300">{vm.mes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Productos */}
        <div className="rock-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-white tracking-wide mb-4">Top Productos</h3>
          <ol className="space-y-3 text-zinc-300">
            <li>Cerveza Premium - 342 unidades</li>
            <li>Cóctel Especial - 189 unidades</li>
            <li>Nachos - 234 unidades</li>
            <li>Whisky Premium - 89 unidades</li>
          </ol>
        </div>

        {/* Cierre de Turno */}
        <div className="rock-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-white tracking-wide mb-4">Cierre de Turno</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-500">Efectivo</p>
              <p className="text-2xl font-black text-white">$ 45,200</p>
            </div>
            <div>
              <p className="text-zinc-500">Tarjetas</p>
              <p className="text-2xl font-black text-white">$ 38,900</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}