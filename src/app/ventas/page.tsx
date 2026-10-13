'use client'

import { useState } from 'react'
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle, Search, CreditCard, Check } from 'lucide-react'
import Link from 'next/link'
import {
  useBarStore,
  addItemToTable,
  updateTableItemQty,
  removeTableItem,
  clearTableOrder,
  setActiveTableId,
  TableState,
  OrderItemState,
  ProductState,
} from '@/lib/barState'

export default function VentasPage() {
  const barData = useBarStore()
  const tables = barData.tables
  const selectedTableId = barData.activeTableId || 1
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

  // Agregar producto a la mesa activa
  const handleAddProduct = (prod: ProductState) => {
    if (prod.stock <= 0) {
      setNotification(`⚠️ "${prod.name}" no tiene existencias en stock.`)
      setTimeout(() => setNotification(''), 3500)
      return
    }

    addItemToTable(selectedTableId, prod, 1)
    setNotification(`¡"${prod.name}" agregado a la Mesa ${selectedTableId}!`)
    setTimeout(() => setNotification(''), 3000)
  }

  // Modificar cantidad en la comanda (+ o -)
  const handleUpdateQty = (productId: string, delta: number) => {
    updateTableItemQty(selectedTableId, productId, delta)
  }

  // Eliminar un producto individual de la orden
  const handleRemoveItem = (productId: string, productName: string) => {
    removeTableItem(selectedTableId, productId)
    setNotification(`"${productName}" retirado de la comanda.`)
    setTimeout(() => setNotification(''), 3000)
  }

  // Vaciar la comanda completa de la mesa
  const handleClearOrder = () => {
    if (currentOrder.length === 0) return
    clearTableOrder(selectedTableId)
    setNotification(`Comanda de la Mesa ${selectedTableId} vaciada con éxito. Stock devuelto a bodega.`)
    setTimeout(() => setNotification(''), 3500)
  }

  const handleSaveOrder = () => {
    setNotification(`¡Comanda sincronizada y guardada para la Mesa ${selectedTableId}!`)
    setTimeout(() => setNotification(''), 3500)
  }

  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')
  const totalAmount = currentOrder.reduce((acc, it) => acc + it.subtotal, 0)
  const totalItemsCount = currentOrder.reduce((acc, it) => acc + it.quantity, 0)

  // Filtrado de productos en vivo
  const productList = barData.products || []
  const filteredProducts = productList.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category.toLowerCase().includes(activeCategory.toLowerCase())
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery))
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
            Selecciona la mesa, pulsa en los productos o en <strong className="text-amber-400 font-bold">+ Agregar</strong> para sumarlos a la comanda.
          </p>
        </div>

        {/* Notificación Toast reactiva */}
        {notification && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Selector de Mesas Activas (1 al 9) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Mesa Destino Seleccionada: <span className="text-white font-black text-sm">Mesa {selectedTableId}</span>
          </label>
          <span className="text-[11px] text-zinc-500">
            {currentTableObj?.status === 'occupied' ? '🔴 Ocupada con consumo' : '🟢 Disponible'}
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {tables.map((t: TableState) => {
            const isSelected = t.id === selectedTableId
            const isOccupied = t.status === 'occupied'

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTableId(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/40 scale-105'
                    : isOccupied
                    ? 'bg-zinc-900 text-red-400 border-red-900/60 hover:border-red-600'
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

      {/* Distribución: Catálogo (izq) y Comanda (der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Catálogo de Productos (7 columnas) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Buscador y Filtros */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar producto por nombre o código..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Categorías */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Productos con Botón Explícito de Agregar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0

              return (
                <div
                  key={p.id}
                  className={`rock-card p-3.5 rounded-xl flex flex-col justify-between h-36 relative transition-all group ${
                    isOutOfStock
                      ? 'opacity-60 border-zinc-800/50'
                      : 'hover:border-red-600 hover:bg-zinc-900/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">{p.category}</span>
                      <span className={`text-[10px] font-semibold ${isOutOfStock ? 'text-red-400' : 'text-zinc-400'}`}>
                        {p.stock} uds
                      </span>
                    </div>
                    <p className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                      {p.name}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white">{formatCOP(p.price)}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleAddProduct(p)}
                      className={`w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer active:scale-95 ${
                        isOutOfStock
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md shadow-red-900/30'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Agotado' : `+ Agregar a M${selectedTableId}`}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel de Comanda de la Mesa (5 columnas) */}
        <div className="lg:col-span-5 rock-card p-5 rounded-2xl shadow-xl space-y-4 border border-zinc-800 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${currentOrder.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
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

            {/* Botón Vaciar Comanda Superior */}
            {currentOrder.length > 0 && (
              <button
                type="button"
                onClick={handleClearOrder}
                className="text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Vaciar todos los productos de esta comanda"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Vaciar Comanda</span>
              </button>
            )}
          </div>

          {/* Lista de Ítems del Pedido */}
          {currentOrder.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800/80 p-4">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50 text-zinc-400" />
              <p className="text-xs font-bold text-zinc-300">La comanda de la Mesa {selectedTableId} está vacía</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Haz clic en el botón <span className="text-amber-400 font-bold">+ Agregar a M{selectedTableId}</span> de cualquier producto a la izquierda.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {currentOrder.map((item) => (
                <div key={item.productId} className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/70 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="pr-2">
                      <p className="font-bold text-white text-xs sm:text-sm">{item.name}</p>
                      <p className="text-[11px] text-zinc-400">{formatCOP(item.unitPrice)} c/u</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-amber-400 text-xs sm:text-sm whitespace-nowrap">{formatCOP(item.subtotal)}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId, item.name)}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-400 mt-0.5 cursor-pointer flex items-center space-x-0.5 ml-auto"
                      >
                        <Trash2 className="w-3 h-3 inline mr-0.5" />
                        <span>Quitar</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                    <span className="text-[11px] text-zinc-400">Cantidad:</span>
                    {/* Selector de cantidad interactivo */}
                    <div className="flex items-center space-x-2 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.productId, -1)}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer transition-colors"
                        title="Restar 1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs text-white px-1.5">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.productId, 1)}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer transition-colors"
                        title="Sumar 1"
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
              <span>Unidades en Comanda ({totalItemsCount})</span>
              <span>{formatCOP(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-zinc-800/80">
              <span>Total a Cobrar</span>
              <span className="text-xl font-black text-amber-400">{formatCOP(totalAmount)}</span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
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

            {/* Botón inferior de vaciar comanda para mayor accesibilidad */}
            {currentOrder.length > 0 && (
              <button
                type="button"
                onClick={handleClearOrder}
                className="w-full flex items-center justify-center space-x-1.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/60 text-zinc-400 hover:text-red-300 font-bold py-2 rounded-xl transition-all text-xs cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Comanda de Mesa {selectedTableId}</span>
              </button>
            )}

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
