import { ShoppingBag, Plus, Minus, Trash2, CheckCircle, Search, CreditCard } from 'lucide-react'

export default function VentasPage() {
  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'cervezas', name: 'Cervezas' },
    { id: 'licores', name: 'Licores' },
    { id: 'cocteles', name: 'Cócteles' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'bebidas', name: 'Sin Alcohol' },
  ]

  const quickProducts = [
    { id: '1', name: 'Corona Extra 355ml', price: 14000, category: 'Cervezas' },
    { id: '2', name: 'Club Colombia Dorada', price: 10000, category: 'Cervezas' },
    { id: '3', name: 'Heineken Long Neck', price: 15000, category: 'Cervezas' },
    { id: '4', name: 'Poker Lata 330ml', price: 8000, category: 'Cervezas' },
    { id: '5', name: 'BBC Cajicá Miel', price: 16000, category: 'Cervezas' },
    { id: '6', name: 'Trago Ron Medellín 8A', price: 18000, category: 'Licores' },
    { id: '7', name: 'Trago Johnnie Walker Black', price: 28000, category: 'Licores' },
    { id: '8', name: 'Trago Aguardiente Antioqueño', price: 12000, category: 'Licores' },
    { id: '9', name: 'Cóctel Rock Margarita', price: 32000, category: 'Cócteles' },
    { id: '10', name: 'Mojito Cubano Clásico', price: 28000, category: 'Cócteles' },
    { id: '11', name: 'Gin Tonic Botanicals', price: 35000, category: 'Cócteles' },
    { id: '12', name: 'Nachos Cheddar & Jalapeños', price: 26000, category: 'Snacks' },
    { id: '13', name: 'Alitas BBQ x8 uds', price: 34000, category: 'Snacks' },
    { id: '14', name: 'Papas Rústicas', price: 22000, category: 'Snacks' },
    { id: '15', name: 'Red Bull 250ml', price: 15000, category: 'Sin Alcohol' },
  ]

  // Comanda activa de ejemplo
  const currentOrderItems = [
    { id: '1', name: 'Corona Extra 355ml', quantity: 3, unitPrice: 14000, subtotal: 42000, notes: 'Bien frías' },
    { id: '2', name: 'Cóctel Rock Margarita', quantity: 2, unitPrice: 32000, subtotal: 64000, notes: 'Vaso escarchado' },
    { id: '3', name: 'Nachos Cheddar & Jalapeños', quantity: 1, unitPrice: 26000, subtotal: 26000, notes: 'Jalapeños aparte' },
  ]

  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')

  const totalAmount = currentOrderItems.reduce((acc, item) => acc + item.subtotal, 0)

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Punto de Venta (POS)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Creación de Pedidos & Barra
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Registra pedidos para mesas o venta directa al paso en la barra.
          </p>
        </div>

        {/* Destino del pedido */}
        <div className="flex items-center space-x-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          <button className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white shadow-md shadow-red-900/30">
            Mesa 3 (Activa)
          </button>
          <button className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
            Venta Directa (Barra)
          </button>
        </div>
      </div>

      {/* Distribución 2 columnas: Catálogo rápido (izq) y Comanda actual (der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Catálogo Rápido de Productos (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Buscador y Filtros */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar producto para agregar al pedido..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Categorías */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat, i) => (
                <button
                  key={cat.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    i === 0
                      ? 'bg-red-600 text-white shadow-md shadow-red-900/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Productos Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickProducts.map((p) => (
              <button
                key={p.id}
                className="rock-card p-4 rounded-xl text-left hover:border-red-600/80 hover:bg-zinc-900/80 transition-all group flex flex-col justify-between h-28 relative"
              >
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">{p.category}</span>
                  <p className="font-bold text-white text-xs sm:text-sm line-clamp-2 mt-0.5 group-hover:text-amber-400 transition-colors">
                    {p.name}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-black text-white">{formatCOP(p.price)}</span>
                  <span className="w-6 h-6 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center font-bold text-xs group-hover:bg-red-600 group-hover:text-white transition-colors">
                    +
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Comanda / Orden Activa (5 cols) */}
        <div className="lg:col-span-5 rock-card p-5 rounded-2xl shadow-xl space-y-5 border border-zinc-800 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-bold text-white text-base">Comanda en Curso</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Destino: <strong className="text-white">Mesa 3</strong> • Mesero: Admin</p>
            </div>
            <button className="text-zinc-500 hover:text-red-400 text-xs font-medium transition-colors flex items-center space-x-1">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Lista de Ítems del Pedido */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {currentOrderItems.map((item) => (
              <div key={item.id} className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="pr-2">
                    <p className="font-bold text-white text-xs sm:text-sm">{item.name}</p>
                    <p className="text-[11px] text-zinc-500">{formatCOP(item.unitPrice)} c/u</p>
                  </div>
                  <p className="font-black text-white text-xs sm:text-sm whitespace-nowrap">{formatCOP(item.subtotal)}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Selector de cantidad */}
                  <div className="flex items-center space-x-2 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                    <button className="text-zinc-400 hover:text-white p-0.5">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs text-white px-1.5">{item.quantity}</span>
                    <button className="text-zinc-400 hover:text-white p-0.5">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {item.notes && (
                    <span className="text-[10px] text-amber-500 font-medium italic">
                      Nota: {item.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Resumen Financiero */}
          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Subtotal Artículos ({currentOrderItems.reduce((a, b) => a + b.quantity, 0)})</span>
              <span>{formatCOP(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Propina / Impoconsumo</span>
              <span className="text-zinc-500">$ 0</span>
            </div>
            <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-zinc-800/80">
              <span>Total de la Cuenta</span>
              <span className="text-xl font-black text-amber-400">{formatCOP(totalAmount)}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-2 pt-2">
            <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Guardar / Enviar a Mesa 3</span>
            </button>

            <button className="w-full flex items-center justify-center space-x-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold py-2.5 rounded-xl transition-all text-xs">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Proceder a Cobro Directo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
