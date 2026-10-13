import { BarChart3, TrendingUp, Calendar, Download, Award } from 'lucide-react'

export default function ReportesPage() {
  const topProducts = [
    { name: 'Cerveza Corona 355ml', sold: 48, revenue: 672000, category: 'Cervezas' },
    { name: 'Cóctel Rock Margarita', sold: 34, revenue: 1088000, category: 'Cócteles' },
    { name: 'Alitas BBQ Rocker x8', sold: 26, revenue: 884000, category: 'Snacks' },
    { name: 'Whisky Johnnie Walker Black', sold: 5, revenue: 1200000, category: 'Licores' },
    { name: 'Club Colombia Dorada', sold: 42, revenue: 420000, category: 'Cervezas' },
  ]

  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Métricas & Rendimiento</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Reportes Operativos
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Análisis de ventas, productos más pedidos y cierres financieros.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold px-4 py-2.5 rounded-xl transition-all text-xs">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>Últimos 7 Días</span>
          </button>
          <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-xs">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rock-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-zinc-400 uppercase">Facturación Período</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">{formatCOP(4264000)}</p>
          <span className="text-xs text-emerald-400 font-bold flex items-center mt-2">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +18.4% respecto al ciclo anterior
          </span>
        </div>
        <div className="rock-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-zinc-400 uppercase">Cuentas Cerradas</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">114</p>
          <span className="text-xs text-zinc-400 mt-2 block">Ticket promedio: {formatCOP(37400)}</span>
        </div>
        <div className="rock-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-zinc-400 uppercase">Margen Bruto Estimado</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">51.2%</p>
          <span className="text-xs text-zinc-400 mt-2 block">Utilidad estimada: {formatCOP(2183000)}</span>
        </div>
      </div>

      {/* Tabla de Productos Más Vendidos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Productos Más Vendidos</span>
          </h3>
        </div>

        <div className="rock-card rounded-2xl overflow-hidden divide-y divide-zinc-800">
          {topProducts.map((p, idx) => (
            <div key={p.name} className="p-4 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.category} • {p.sold} unidades servidas</p>
                </div>
              </div>
              <p className="text-sm font-black text-white">{formatCOP(p.revenue)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
