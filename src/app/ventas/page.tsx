'use client'

import { useState } from 'react'
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Search,
  CreditCard,
  Check,
  User,
  Edit2,
  X,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import {
  useBarStore,
  addItemToTable,
  updateTableItemQty,
  removeTableItem,
  clearTableOrder,
  setActiveTableId,
  addTable,
  updateTable,
  TableState,
  OrderItemState,
  ProductState,
} from '@/lib/barState'

export default function VentasPage() {
  const barData = useBarStore()
  const tables = barData.tables || []
  const selectedTableId = barData.activeTableId || 1
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [notification, setNotification] = useState<string>('')

  // Modales en el POS
  const [showNewTableModal, setShowNewTableModal] = useState<boolean>(false)
  const [showEditCustomerModal, setShowEditCustomerModal] = useState<boolean>(false)

  // Formulario Nueva Mesa/Cuenta rápida
  const [quickTableName, setQuickTableName] = useState<string>('')
  const [quickCustomerName, setQuickCustomerName] = useState<string>('')

  // Formulario Editar Cliente de la Comanda
  const [editCustomerVal, setEditCustomerVal] = useState<string>('')

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
    if (prod.active === false) {
      setNotification(`⚠️ "${prod.name}" está pausado temporalmente para la venta.`)
      setTimeout(() => setNotification(''), 3500)
      return
    }
    if (prod.stock <= 0) {
      setNotification(`⚠️ "${prod.name}" no tiene existencias en stock.`)
      setTimeout(() => setNotification(''), 3500)
      return
    }

    addItemToTable(selectedTableId, prod, 1)
    setNotification(`¡"${prod.name}" agregado a ${currentTableObj?.name || 'Mesa'}!`)
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
    setNotification(`Comanda de ${currentTableObj?.name || 'Mesa'} vaciada. Stock devuelto a bodega.`)
    setTimeout(() => setNotification(''), 3500)
  }

  const handleSaveOrder = () => {
    setNotification(`¡Comanda sincronizada y guardada para ${currentTableObj?.name || 'Mesa'}!`)
    setTimeout(() => setNotification(''), 3500)
  }

  // Crear mesa/cuenta rápida desde el POS
  const handleCreateQuickTable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTableName.trim() && !quickCustomerName.trim()) return

    const tName = quickTableName.trim() || (quickCustomerName.trim() ? `Cuenta: ${quickCustomerName.trim()}` : `Mesa ${tables.length + 1}`)

    const created = addTable({
      name: tName,
      customerName: quickCustomerName.trim() || undefined,
      capacity: 4,
      autoOpen: true,
    })

    setShowNewTableModal(false)
    setQuickTableName('')
    setQuickCustomerName('')
    setActiveTableId(created.id)
    setNotification(`¡${created.name} ${created.customerName ? `(${created.customerName})` : ''} lista para pedir!`)
    setTimeout(() => setNotification(''), 4000)
  }

  // Guardar nombre del cliente en la comanda actual
  const handleSaveCustomerName = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTableObj) return

    updateTable(currentTableObj.id, {
      customerName: editCustomerVal.trim() || undefined,
    })

    setShowEditCustomerModal(false)
    setNotification(`Cliente de ${currentTableObj.name} actualizado: "${editCustomerVal.trim() || 'Sin asignar'}"`)
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
            Selecciona la mesa o cliente, pulsa en los productos o en <strong className="text-amber-400 font-bold">+ Agregar</strong> para sumarlos a la comanda.
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

      {/* Selector de Mesas y Cuentas Activas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Mesa / Cuenta: <span className="text-white font-black text-sm">{currentTableObj?.name || `Mesa ${selectedTableId}`}</span>
            </label>
            {currentTableObj?.customerName && (
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{currentTableObj.customerName}</span>
              </span>
            )}
          </div>
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
                {t.customerName && (
                  <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded ${isSelected ? 'bg-red-700 text-white' : 'bg-zinc-800 text-amber-400'}`}>
                    {t.customerName}
                  </span>
                )}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isOccupied ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />
              </button>
            )
          })}

          {/* Botón rápido para crear mesa o cuenta de cliente */}
          <button
            type="button"
            onClick={() => {
              setQuickTableName(`Mesa ${tables.length + 1}`)
              setQuickCustomerName('')
              setShowNewTableModal(true)
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-amber-500/30 flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Cuenta</span>
          </button>
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
              const isInactive = p.active === false
              const isDisabled = isOutOfStock || isInactive

              return (
                <div
                  key={p.id}
                  className={`rock-card p-3.5 rounded-xl flex flex-col justify-between h-36 relative transition-all group ${
                    isDisabled
                      ? 'opacity-60 border-zinc-800/50'
                      : 'hover:border-red-600 hover:bg-zinc-900/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">{p.category}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isInactive
                            ? 'text-zinc-500'
                            : isOutOfStock
                            ? 'text-red-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {isInactive ? 'Pausado' : `${p.stock} uds`}
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
                      disabled={isDisabled}
                      onClick={() => handleAddProduct(p)}
                      className={`w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer active:scale-95 ${
                        isDisabled
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md shadow-red-900/30'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {isInactive
                          ? 'Pausado'
                          : isOutOfStock
                          ? 'Agotado'
                          : `+ Agregar a ${currentTableObj?.name || 'Mesa'}`}
                      </span>
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
                <h3 className="font-bold text-white text-base">
                  {currentTableObj?.name || `Mesa ${selectedTableId}`}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditCustomerVal(currentTableObj?.customerName || '')
                    setShowEditCustomerModal(true)
                  }}
                  title="Asignar o cambiar nombre del cliente en esta comanda"
                  className="p-1 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {currentTableObj?.customerName ? (
                <p className="text-xs text-amber-400 font-bold flex items-center space-x-1 mt-0.5">
                  <User className="w-3 h-3" />
                  <span>Cliente: {currentTableObj.customerName}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditCustomerVal('')
                    setShowEditCustomerModal(true)
                  }}
                  className="text-[11px] text-zinc-500 hover:text-amber-400 italic underline mt-0.5 cursor-pointer block"
                >
                  + Asignar nombre del cliente
                </button>
              )}

              <p className="text-[11px] text-zinc-500 mt-1">
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
              <p className="text-xs font-bold text-zinc-300">La comanda de {currentTableObj?.name || 'esta mesa'} está vacía</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Haz clic en el botón <span className="text-amber-400 font-bold">+ Agregar</span> de cualquier producto a la izquierda.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {currentOrder.map((it: OrderItemState) => (
                <div
                  key={it.productId}
                  className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs transition-all hover:border-zinc-700"
                >
                  <div className="space-y-0.5 flex-1 pr-2">
                    <p className="font-bold text-white text-xs leading-snug">{it.name}</p>
                    <p className="text-zinc-500 text-[11px]">
                      {it.quantity} x {formatCOP(it.unitPrice)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Botones de Cantidad (+ y -) */}
                    <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(it.productId, -1)}
                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                        title="Restar 1 unidad"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-white text-xs px-1.5">{it.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(it.productId, 1)}
                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                        title="Sumar 1 unidad"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-black text-amber-400 w-20 text-right text-xs">
                      {formatCOP(it.subtotal)}
                    </span>

                    {/* Botón Eliminar Ítem Individual */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(it.productId, it.name)}
                      className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded transition-colors cursor-pointer"
                      title="Eliminar de la comanda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
              <span>Guardar Comanda en {currentTableObj?.name || 'Mesa'}</span>
            </button>

            {/* Botón inferior de vaciar comanda */}
            {currentOrder.length > 0 && (
              <button
                type="button"
                onClick={handleClearOrder}
                className="w-full flex items-center justify-center space-x-1.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/60 text-zinc-400 hover:text-red-300 font-bold py-2 rounded-xl transition-all text-xs cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Comanda</span>
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

      {/* ========================================================================= */}
      {/* MODAL: NUEVA MESA O CUENTA RÁPIDA EN POS */}
      {/* ========================================================================= */}
      {showNewTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-sm p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Crear Cuenta de Cliente</h3>
                  <p className="text-xs text-zinc-400">Abre una mesa o cuenta separada</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTableModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickTable} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nombre de la Mesa o Lugar *
                </label>
                <input
                  type="text"
                  required
                  value={quickTableName}
                  onChange={(e) => setQuickTableName(e.target.value)}
                  placeholder="Ej. Mesa 4, Barra 2, Mesa 1 - B..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nombre del Cliente (Para cuentas separadas)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={quickCustomerName}
                    onChange={(e) => setQuickCustomerName(e.target.value)}
                    placeholder="Ej. Andrés, Pareja, Grupo Rock..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewTableModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                >
                  Crear y Seleccionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR CLIENTE DE LA COMANDA ACTUAL */}
      {/* ========================================================================= */}
      {showEditCustomerModal && currentTableObj && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-sm p-6 rounded-3xl border border-amber-500/40 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Cliente de {currentTableObj.name}</h3>
                  <p className="text-xs text-zinc-400">Identifica quién paga esta cuenta</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCustomerModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerName} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nombre del Cliente / Titular
                </label>
                <input
                  type="text"
                  autoFocus
                  value={editCustomerVal}
                  onChange={(e) => setEditCustomerVal(e.target.value)}
                  placeholder="Ej. Carlos Giraldo, Cuenta 2..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditCustomerModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
                >
                  Guardar Nombre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
