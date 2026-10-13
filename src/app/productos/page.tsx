import { Package, Plus, Search, AlertTriangle, CheckCircle, Filter } from 'lucide-react'

export default function ProductosPage() {
  const categories = [
    { id: 'all', name: 'Todos', count: 18 },
    { id: 'cervezas', name: 'Cervezas', count: 6 },
    { id: 'licores', name: 'Licores & Botellas', count: 5 },
    { id: 'cocteles', name: 'Cócteles de Autor', count: 4 },
    { id: 'bebidas', name: 'Bebidas sin Alcohol', count: 4 },
    { id: 'snacks', name: 'Snacks & Comida', count: 4 },
  ]

  const products = [
    // Cervezas
    {
      id: '1',
      name: 'Cerveza Corona Extra 355ml',
      category: 'Cervezas',
      barcode: '7701234001',
      price: 14000,
      cost: 7500,
      stock: 36,
      min_stock: 12,
      active: true,
    },
    {
      id: '2',
      name: 'Cerveza Club Colombia Dorada 330ml',
      category: 'Cervezas',
      barcode: '7701234002',
      price: 10000,
      cost: 5200,
      stock: 48,
      min_stock: 15,
      active: true,
    },
    {
      id: '3',
      name: 'Cerveza Heineken Long Neck',
      category: 'Cervezas',
      barcode: '7701234003',
      price: 15000,
      cost: 8000,
      stock: 24,
      min_stock: 10,
      active: true,
    },
    {
      id: '4',
      name: 'Cerveza Artesanal BBC Cajicá Miel',
      category: 'Cervezas',
      barcode: '7701234004',
      price: 16000,
      cost: 8800,
      stock: 6,
      min_stock: 12,
      active: true,
    },
    {
      id: '5',
      name: 'Cerveza Águila Original 330ml',
      category: 'Cervezas',
      barcode: '7701234005',
      price: 8000,
      cost: 4100,
      stock: 60,
      min_stock: 20,
      active: true,
    },
    {
      id: '6',
      name: 'Cerveza Poker Lata 330ml',
      category: 'Cervezas',
      barcode: '7701234006',
      price: 8000,
      cost: 4000,
      stock: 5,
      min_stock: 15,
      active: true,
    },

    // Licores
    {
      id: '7',
      name: 'Whisky Johnnie Walker Black Label 750ml',
      category: 'Licores & Botellas',
      barcode: '7701234007',
      price: 240000,
      cost: 150000,
      stock: 8,
      min_stock: 3,
      active: true,
    },
    {
      id: '8',
      name: 'Ron Medellín Añejo 8 Años 750ml',
      category: 'Licores & Botellas',
      barcode: '7701234008',
      price: 120000,
      cost: 72000,
      stock: 12,
      min_stock: 4,
      active: true,
    },
    {
      id: '9',
      name: 'Aguardiente Antioqueño Azul 750ml',
      category: 'Licores & Botellas',
      barcode: '7701234009',
      price: 85000,
      cost: 51000,
      stock: 14,
      min_stock: 5,
      active: true,
    },
    {
      id: '10',
      name: 'Tequila José Cuervo Especial 750ml',
      category: 'Licores & Botellas',
      barcode: '7701234010',
      price: 160000,
      cost: 98000,
      stock: 5,
      min_stock: 2,
      active: true,
    },
    {
      id: '11',
      name: 'Ginebra Tanqueray London Dry 750ml',
      category: 'Licores & Botellas',
      barcode: '7701234011',
      price: 195000,
      cost: 120000,
      stock: 4,
      min_stock: 2,
      active: true,
    },

    // Cócteles
    {
      id: '12',
      name: 'Cóctel Rock Margarita',
      category: 'Cócteles de Autor',
      barcode: '7701234012',
      price: 32000,
      cost: 11000,
      stock: 50,
      min_stock: 10,
      active: true,
    },
    {
      id: '13',
      name: 'Mojito Cubano Clásico',
      category: 'Cócteles de Autor',
      barcode: '7701234013',
      price: 28000,
      cost: 9500,
      stock: 50,
      min_stock: 10,
      active: true,
    },
    {
      id: '14',
      name: 'Gin Tonic Cítrico Botanicals',
      category: 'Cócteles de Autor',
      barcode: '7701234014',
      price: 35000,
      cost: 13000,
      stock: 40,
      min_stock: 10,
      active: true,
    },

    // Snacks
    {
      id: '15',
      name: 'Nachos Rock con Queso Cheddar & Jalapeños',
      category: 'Snacks & Comida',
      barcode: '7701234015',
      price: 26000,
      cost: 11500,
      stock: 18,
      min_stock: 5,
      active: true,
    },
    {
      id: '16',
      name: 'Alitas BBQ Rocker x8 uds',
      category: 'Snacks & Comida',
      barcode: '7701234016',
      price: 34000,
      cost: 16000,
      stock: 15,
      min_stock: 6,
      active: true,
    },
    {
      id: '17',
      name: 'Papas Rústicas con Tocineta',
      category: 'Snacks & Comida',
      barcode: '7701234017',
      price: 22000,
      cost: 9000,
      stock: 22,
      min_stock: 8,
      active: true,
    },

    // Bebidas sin alcohol
    {
      id: '18',
      name: 'Bebida Energizante Red Bull 250ml',
      category: 'Bebidas sin Alcohol',
      barcode: '7701234018',
      price: 15000,
      cost: 8500,
      stock: 20,
      min_stock: 8,
      active: true,
    },
  ]

  const formatCOP = (val: number) => {
    return '$ ' + val.toLocaleString('es-CO')
  }

  const totalStockItems = products.reduce((acc, p) => acc + p.stock, 0)
  const lowStockCount = products.filter((p) => p.stock <= p.min_stock).length

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <Package className="w-4 h-4" />
            <span>Inventario & Menú</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Catálogo de Productos
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Administración de bebidas, licores, cócteles, snacks, precios y existencias.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm">
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Métricas Rápidas del Catálogo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rock-card p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Productos</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{products.length}</p>
          <span className="text-[11px] text-zinc-500">En 5 categorías</span>
        </div>
        <div className="rock-card p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Unidades en Stock</p>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{totalStockItems}</p>
          <span className="text-[11px] text-zinc-500">Existencias físicas</span>
        </div>
        <div className="rock-card p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Alertas de Stock</p>
          <p className={`text-xl sm:text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
            {lowStockCount}
          </p>
          <span className="text-[11px] text-zinc-500">Por debajo del mínimo</span>
        </div>
        <div className="rock-card p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Margen Promedio</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">48.5%</p>
          <span className="text-[11px] text-zinc-500">Estimado sobre costo</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por nombre de producto o código de barras..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span>Filtrar</span>
            </button>
          </div>
        </div>

        {/* Píldoras de Categorías */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                idx === 0
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => {
          const isLowStock = p.stock <= p.min_stock
          const margin = Math.round(((p.price - p.cost) / p.price) * 100)

          return (
            <div
              key={p.id}
              className={`rock-card p-5 rounded-2xl transition-all relative overflow-hidden group hover:border-red-600/70 ${
                isLowStock ? 'border-amber-500/50' : ''
              }`}
            >
              {/* Badge superior */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/60">
                  {p.category}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 ${
                    isLowStock
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isLowStock ? (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1 inline" />
                      <span>Stock Bajo</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1 inline" />
                      <span>Disponible</span>
                    </>
                  )}
                </span>
              </div>

              {/* Título */}
              <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-400 transition-colors mb-1">
                {p.name}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono mb-4">SKU: {p.barcode}</p>

              {/* Métricas de Precio & Costo */}
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 mb-4 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Precio Venta</p>
                  <p className="text-base font-black text-white tracking-wide">{formatCOP(p.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">Costo Compra</p>
                  <p className="text-xs font-semibold text-zinc-400">{formatCOP(p.cost)}</p>
                  <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Margen ~{margin}%</p>
                </div>
              </div>

              {/* Barra de Stock */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/80">
                <span className="text-zinc-400">
                  Stock:{' '}
                  <strong className={isLowStock ? 'text-amber-400 font-black' : 'text-zinc-200'}>
                    {p.stock} uds
                  </strong>
                </span>
                <span className="text-[11px] text-zinc-500">Mín: {p.min_stock} uds</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
