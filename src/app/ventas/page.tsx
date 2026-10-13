'use client'

import { useState } from 'react'
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle, Search, CreditCard, Check } from 'lucide-react'
import Link from 'next/link'
import { useBarStore, loadBarData, saveBarData, INITIAL_PRODUCTS, TableState, OrderItemState, ProductState } from '@/lib/barState'

export default function VentasPage() {
  const barData = useBarStore()
  const tables = barData.tables
  const [selectedTableId, setSelectedTableId] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [notification, setNotification] = useState<string>('')

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'Cervezas', name: 'Cervezas' },
    { id: 'Licores', name: 'Licores' },
    { id: 'Cócteles', name: 'Cócteles' },
    { id: 'Snacks', name: 'Snacks' },
    { id: 'Sin Alcohol', name: 'Sin Alcohol' },
  ]

  const currentTableObj = tables.find((t) => t.id === selectedTableId) || tables[0]
  const currentOrder: OrderItemState[] = currentTableObj ? currentTableObj.items : []

  // Guardar cambio en comanda de la mesa activa
  const updateTableItems = (newItems: OrderItemState[]) => {
    const data = loadBarData()
    const totalAmount = newItems.reduce((acc, it) => acc + it.subtotal, 0)

    const updatedTables = data.tables.map((t) => {
      if (t.id === selectedTableId) {
        const newPaid = t.paid || 0
        const newPending = Math.max(0, totalAmount - newPaid)
        return {
          ...t,
          status: newItems.length > 0 ? ('occupied' as const) : t.status,
          items: newItems,
          total: totalAmount,
          paid: newPaid,
          pending: newPending,
          openedAt: t.openedAt || new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        }
      }
      return t
    })

    data.tables = updatedTables
    saveBarData(data)
  }

  // Agregar producto a la orden
  const handleAddProduct = (prod: ProductState) => {
    const existing = currentOrder.find((it) => it.productId === prod.id)
    let newItems: OrderItemState[]
    if (existing) {
      newItems = currentOrder.map((it) =>
        it.productId === prod.id
          ? { ...it, quantity: it.quantity + 1, subtotal: (it.quantity + 1) * it.unitPrice }
          : it
      )
    } else {
      newItems = [
        ...currentOrder,
        {
          productId: prod.id,
          name: prod.name,
          quantity: 1,
          unitPrice: prod.price,
          subtotal: prod.price,
        },
      ]
    }
    updateTableItems(newItems)
  }

  // Modificar cantidad
  const handleUpdateQty = (productId: string, delta: number) => {
    const newItems = currentOrder
      .map((it) => {
        if (it.productId === productId) {
          const newQty = it.quantity + delta
          if (newQty <= 0) return null
          return { ...it, quantity: newQty, subtotal: newQty * it.unitPrice }
        }
        return it
      })
      .filter(Boolean) as OrderItemState[]

    updateTableItems(newItems)
  }

  // Eliminar ítem
  const handleRemoveItem = (productId: string) => {
    const newItems = currentOrder.filter((it) => it.productId !== productId)
    updateTableItems(newItems)
  }

  // Vaciar comanda
  const handleClearOrder = () => {
    updateTableItems([])
  }

  const handleSaveOrder = () => {
    setNotification(`¡Comanda sincronizada y guardada para la Mesa ${selectedTableId}!`)
    setTimeout(() => setNotification(''), 4000)
  }

  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')

  const totalAmount = currentOrder.reduce((acc, it) => acc + it.subtotal, 0)

  // Filtrado de productos en vivo
  const productList = barData.products || INITIAL_PRODUCTS
  const filteredProducts = productList.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category.toLowerCase().includes(activeCategory.toLowerCase())
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesQuery
  })

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Punto de Venta & Comandas • Operador Único</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Creación de Pedidos
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Selecciona la mesa destino, haz clic en los productos para agregarlos y guarda o cobra la comanda.
          </p>
        </div>

        {/* Notificación si existe */}
        {notification && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Selector Rápido de Mesas (1 al 9) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
          Mesa Destino del Pedido:
        </label>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {tables.map((t: TableState) => {
            const isSelected = t.id === selectedTableId
            const isOccupied = t.status === 'occupied'

            return (
              <button
                key={t.id}
                onClick={() => setSelectedTableId(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/30'
                    : isOccupied
                    ? 'bg-zinc-900 text-red-400 border-red-900/50 hover:border-red-600'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span>{t.name}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOccupied ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Distribución 2 columnas: Catálogo rápido (izq) y Comanda actual (der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Catálogo Rápido de Productos (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Buscador y Filtros */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre de producto..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Categorías */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-red-600 text-white shadow-md shadow-red-900/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Productos Clicables */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAddProduct(p)}
                className="rock-card p-3.5 rounded-xl text-left hover:border-red-600 hover:bg-zinc-900 transition-all group flex flex-col justify-between h-28 relative cursor-pointer active:scale-95"
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
                <h3 className="font-bold text-white text-base">Comanda: Mesa {selectedTableId}</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Estado:{' '}
                <strong className={currentTableObj?.status === 'occupied' ? 'text-red-400' : 'text-emerald-400'}>
                  {currentTableObj?.status === 'occupied' ? 'Ocupada' : 'Disponible'}
                </strong>{' '}
                • Operador: Cajero Principal
              </p>
            </div>
            {currentOrder.length > 0 && (
              <button
                onClick={handleClearOrder}
                className="text-zinc-500 hover:text-red-400 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          {/* Lista de Ítems del Pedido */}
          {currentOrder.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">No hay productos en esta comanda aún.</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Haz clic en los productos del catálogo para añadir.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {currentOrder.map((item) => (
                <div key={item.productId} className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="pr-2">
                      <p className="font-bold text-white text-xs sm:text-sm">{item.name}</p>
                      <p className="text-[11px] text-zinc-500">{formatCOP(item.unitPrice)} c/u</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white text-xs sm:text-sm whitespace-nowrap">{formatCOP(item.subtotal)}</p>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-[10px] text-red-500 hover:text-red-400 mt-0.5 cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Selector de cantidad */}
                    <div className="flex items-center space-x-2 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                      <button
                        onClick={() => handleUpdateQty(item.productId, -1)}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs text-white px-1.5">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.productId, 1)}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resumen Financiero */}
          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Subtotal Artículos ({currentOrder.reduce((a, b) => a + b.quantity, 0)})</span>
              <span>{formatCOP(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-zinc-800/80">
              <span>Total Comanda</span>
              <span className="text-xl font-black text-amber-400">{formatCOP(totalAmount)}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSaveOrder}
              disabled={currentOrder.length === 0}
              className={`w-full flex items-center justify-center space-x-2 font-bold py-3 rounded-xl transition-all text-sm ${
                currentOrder.length > 0
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-900/30 cursor-pointer active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Guardar Comanda en Mesa {selectedTableId}</span>
            </button>

            <Link
              href="/cobro"
              className="w-full flex items-center justify-center space-x-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold py-2.5 rounded-xl transition-all text-xs"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Proceder al Módulo de Cobros</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
