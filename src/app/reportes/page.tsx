"use client"

import { DollarSign, BarChart3, Zap, Calendar } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useBarStore } from '@/lib/barState'

export default function ReportesPage() {
  const barData = useBarStore()
  const [fechaInicio, setFechaInicio] = useState<string>('2026-10-01')
  const [fechaFin, setFechaFin] = useState<string>('2026-10-31')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ventas' | 'caja' | 'productos'>('todos')
  const [filtroUsuario, setFiltroUsuario] = useState<string>('')

  const formatCOP = (val: number) => '$ ' + Math.round(val).toLocaleString('es-CO')

  // Cálculos reales a partir del estado del negocio (inicia en 0 para cuentas nuevas y crece con la operación)
  const metrics = useMemo(() => {
    const tables = barData.tables || []
    const closedSales = barData.closedSales || []
    const movements = barData.movements || []
    const sessions = barData.sessions || []
    const cash = barData.cash || {
      initialCash: 0,
      cashSales: 0,
      electronicSales: 0,
      expenses: 0,
      expectedCash: 0,
      status: 'closed',
      openedAt: '',
    }

    // Filtrar por usuario si aplica
    const matchUser = (operatorName?: string) => {
      if (!filtroUsuario) return true
      const op = (operatorName || '').toLowerCase()
      if (filtroUsuario === 'admin') return op.includes('admin') || op.includes('propietario') || op === (barData.operatorName || '').toLowerCase()
      if (filtroUsuario === 'staff') return !op.includes('admin')
      return op === filtroUsuario.toLowerCase()
    }

    // 1. Ventas reales (movimientos de venta, recibos cerrados y ventas del turno actual)
    const saleMovements = movements.filter((m) => m.type === 'sale' && matchUser(m.user))
    const ventasPorMovimientos = saleMovements.reduce((acc, m) => acc + Math.abs(m.amount || 0), 0)

    const filteredClosedSales = closedSales.filter((s) => matchUser(s.operator))
    const ventasPorRecibos = filteredClosedSales.reduce((acc, s) => acc + (s.total || 0), 0)

    const ventasTurnoActual = !filtroUsuario
      ? (cash.cashSales || 0) + (cash.electronicSales || 0)
      : 0

    const ventasSesionesCerradas = !filtroUsuario
      ? sessions
          .filter((s) => s.status === 'closed')
          .reduce((acc, s) => acc + (s.cashSales || 0) + (s.electronicSales || 0), 0)
      : 0

    const totalVentas = Math.max(
      ventasPorMovimientos,
      ventasPorRecibos,
      cash.status === 'open' ? ventasSesionesCerradas + ventasTurnoActual : Math.max(ventasSesionesCerradas, ventasTurnoActual)
    )

    // 2. Ocupación de mesas en tiempo real
    const totalMesas = tables.length || 8
    const mesasOcupadas = tables.filter(
      (t) => (t.status === 'occupied' || (t.items && t.items.length > 0) || (t.total || 0) > 0) && matchUser(t.operator)
    ).length
    const ocupacionPct = totalMesas > 0 ? Math.round((mesasOcupadas / totalMesas) * 100) : 0

    // 3. Unidades de productos vendidos y ranking Top Productos
    // Se suman los ítems de ventas cerradas + ítems en comandas activas (al cerrar mesa pasan de tables a closedSales sin duplicarse)
    const productCountMap = new Map<string, { name: string; quantity: number; revenue: number }>()

    for (const receipt of filteredClosedSales) {
      for (const item of receipt.items || []) {
        const key = item.productId || item.name
        const prev = productCountMap.get(key) || { name: item.name, quantity: 0, revenue: 0 }
        productCountMap.set(key, {
          name: item.name,
          quantity: prev.quantity + (item.quantity || 0),
          revenue: prev.revenue + (item.subtotal || 0),
        })
      }
    }

    for (const table of tables) {
      if (!matchUser(table.operator)) continue
      for (const item of table.items || []) {
        const key = item.productId || item.name
        const prev = productCountMap.get(key) || { name: item.name, quantity: 0, revenue: 0 }
        productCountMap.set(key, {
          name: item.name,
          quantity: prev.quantity + (item.quantity || 0),
          revenue: prev.revenue + (item.subtotal || 0),
        })
      }
    }

    const topProductos = Array.from(productCountMap.values()).sort((a, b) => b.quantity - a.quantity)
    const totalUnidadesVendidas = topProductos.reduce((acc, p) => acc + p.quantity, 0)

    // 4. Caja y medios de pago
    const efectivoTurno = cash.cashSales || 0
    const tarjetasTurno = cash.electronicSales || 0
    const saldoCaja = cash.expectedCash || 0

    // Porcentajes de crecimiento / estado (0% cuando la cuenta está en 0)
    const variacionVentas = totalVentas > 0 ? `+${saleMovements.length || filteredClosedSales.length || 1} venta(s)` : '0%'
    const variacionMesas = ocupacionPct > 0 ? `${mesasOcupadas}/${totalMesas} activas` : '0%'
    const variacionProductos = totalUnidadesVendidas > 0 ? `+${topProductos.length} prod.` : '0%'
    const variacionCaja = saldoCaja > 0 ? (cash.status === 'open' ? 'Turno activo' : 'En caja') : '0%'

    return {
      totalVentas,
      ocupacionPct,
      mesasOcupadas,
      totalMesas,
      totalUnidadesVendidas,
      topProductos,
      saldoCaja,
      efectivoTurno,
      tarjetasTurno,
      variacionVentas,
      variacionMesas,
      variacionProductos,
      variacionCaja,
    }
  }, [barData, filtroUsuario])

  const reportesData = [
    {
      id: 1,
      tipo: 'venta',
      filtro: 'ventas',
      titulo: 'Ventas del Mes',
      valor: formatCOP(metrics.totalVentas),
      variacion: metrics.variacionVentas,
      icon: DollarSign,
      tiempo: 'Mes actual',
      subtitulo: 'Total acumulado de ventas',
    },
    {
      id: 2,
      tipo: 'mesa',
      filtro: 'ventas',
      titulo: 'Mesas Ocupadas',
      valor: `${metrics.ocupacionPct}%`,
      variacion: metrics.variacionMesas,
      icon: BarChart3,
      tiempo: 'Turno actual',
      subtitulo: 'Promedio de ocupación',
    },
    {
      id: 3,
      tipo: 'producto',
      filtro: 'productos',
      titulo: 'Productos Más Vendidos',
      valor: `${metrics.totalUnidadesVendidas.toLocaleString('es-CO')} unidades`,
      variacion: metrics.variacionProductos,
      icon: BarChart3,
      tiempo: 'Acumulado',
      subtitulo: 'Top de productos',
    },
    {
      id: 4,
      tipo: 'caja',
      filtro: 'caja',
      titulo: 'Resumen de Caja',
      valor: formatCOP(metrics.saldoCaja),
      variacion: metrics.variacionCaja,
      icon: Zap,
      tiempo: 'Turno actual',
      subtitulo: 'Efectivo en caja',
    },
  ]

  const tarjetasVisibles = reportesData.filter(
    (r) => filtroTipo === 'todos' || r.filtro === filtroTipo
  )

  const ventasMensuales = [
    { mes: 'Jul', ventas: 0 },
    { mes: 'Ago', ventas: 0 },
    { mes: 'Sep', ventas: 0 },
    { mes: 'Oct', ventas: metrics.totalVentas },
  ]

  const maxVentaMensual = Math.max(...ventasMensuales.map((v) => v.ventas), 1)

  const handleDownloadCSV = () => {
    const rows = [
      ['Indicador', 'Valor', 'Detalle'],
      ['Ventas Acumuladas', String(metrics.totalVentas), metrics.variacionVentas],
      ['Ocupacion de Mesas (%)', `${metrics.ocupacionPct}%`, `${metrics.mesasOcupadas} de ${metrics.totalMesas} mesas`],
      ['Unidades Vendidas', String(metrics.totalUnidadesVendidas), `${metrics.topProductos.length} productos distintos`],
      ['Efectivo Esperado en Caja', String(metrics.saldoCaja), barData.cash?.status === 'open' ? 'Turno Abierto' : 'Turno Cerrado'],
      ['Ventas en Efectivo (Turno)', String(metrics.efectivoTurno), 'Efectivo'],
      ['Ventas en Tarjetas/Transf. (Turno)', String(metrics.tarjetasTurno), 'Electronico'],
    ]

    if (metrics.topProductos.length > 0) {
      rows.push([])
      rows.push(['Producto', 'Unidades Vendidas', 'Total Generado'])
      for (const p of metrics.topProductos) {
        rows.push([p.name, String(p.quantity), String(p.revenue)])
      }
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `reporte_bar_${fechaInicio}_a_${fechaFin}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      {/* Header del módulo de reportes */}
      <div className="relative overflow-hidden rounded-3xl rock-gradient p-6 sm:p-8 border border-red-900/40 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-red-600/30 border border-red-500/40 px-3 py-1 rounded-full text-amber-400 text-xs font-semibold mb-4">
            <span>📊 Reportes</span>
            <span>•</span>
            <span>{barData.settings?.barName || 'Rock Bar'} POS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Módulo de Reportes
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base">
            Información operativa y financiera del negocio en tiempo real.
          </p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tarjetasVisibles.map((report) => {
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
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="w-full pl-4 py-2 rounded border border-zinc-700 background-zinc-900 text-zinc-100"
            >
              <option value="">Todos</option>
              <option value="admin">Administrador / Propietario</option>
              <option value="staff">Empleado</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="w-full py-2 rounded border border-amber-500 bg-amber-500/10 text-amber-400 font-medium uppercase tracking-wider hover:bg-amber-600/20 transition-colors cursor-pointer"
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
              {ventasMensuales.map((vm) => {
                const heightPct = vm.ventas > 0 ? Math.max(8, Math.round((vm.ventas / maxVentaMensual) * 100)) : 2
                const label = vm.ventas >= 1000 ? `$${(vm.ventas / 1000).toFixed(0)}k` : `$${vm.ventas}`
                return (
                  <div key={vm.mes} className="flex flex-col items-center flex-1 space-y-1 h-full justify-end">
                    <span className="text-[10px] text-zinc-400">{label}</span>
                    <div
                      className={`w-8 rounded-t-md transition-all ${
                        vm.ventas > 0
                          ? 'bg-gradient-to-t from-red-600 to-amber-500 hover:brightness-125'
                          : 'bg-zinc-800'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-xs font-semibold text-zinc-300">{vm.mes}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Productos */}
        <div className="rock-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-white tracking-wide mb-4">Top Productos</h3>
          {metrics.topProductos.length > 0 ? (
            <ol className="space-y-3 text-zinc-300">
              {metrics.topProductos.slice(0, 5).map((prod, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm border-b border-zinc-800/60 pb-2">
                  <span className="font-medium text-white truncate pr-2">
                    {idx + 1}. {prod.name}
                  </span>
                  <span className="text-amber-400 font-bold shrink-0">
                    {prod.quantity} {prod.quantity === 1 ? 'unidad' : 'unidades'}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-500 text-sm">
              <p className="font-semibold text-zinc-400">0 unidades vendidas</p>
              <p className="text-xs mt-1">
                Los productos más vendidos irán apareciendo aquí a medida que registres pedidos y ventas.
              </p>
            </div>
          )}
        </div>

        {/* Cierre de Turno */}
        <div className="rock-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-white tracking-wide mb-4">Cierre de Turno</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-500 text-sm">Efectivo</p>
              <p className="text-2xl font-black text-white mt-1">{formatCOP(metrics.efectivoTurno)}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Tarjetas</p>
              <p className="text-2xl font-black text-white mt-1">{formatCOP(metrics.tarjetasTurno)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
