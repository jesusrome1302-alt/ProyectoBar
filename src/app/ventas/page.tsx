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
  Tag,
  Clock,
  Zap,
  Power,
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
  getEffectiveProductPrice,
  isPromotionActiveNow,
  addPromotionRule,
  togglePromotionRule,
  toggleForcePromotionNow,
  deletePromotionRule,
  applyManualDiscountToTable,
  TableState,
  OrderItemState,
  ProductState,
} from '@/lib/barState'

const DAYS_LIST = [
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mié' },
  { id: 4, label: 'Jue' },
  { id: 5, label: 'Vie' },
  { id: 6, label: 'Sáb' },
  { id: 0, label: 'Dom' },
]

export default function VentasPage() {
  const barData = useBarStore()
  const tables = barData.tables || []
  const promotions = barData.promotions || []
  const selectedTableId = barData.activeTableId || 1
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [notification, setNotification] = useState<string>('')

  // Modales en el POS
  const [showNewTableModal, setShowNewTableModal] = useState<boolean>(false)
  const [showEditCustomerModal, setShowEditCustomerModal] = useState<boolean>(false)
  const [showDiscountsModal, setShowDiscountsModal] = useState<boolean>(false)

  // Formulario Nueva Mesa/Cuenta rápida
  const [quickTableName, setQuickTableName] = useState<string>('')
  const [quickCustomerName, setQuickCustomerName] = useState<string>('')

  // Formulario Editar Cliente de la Comanda
  const [editCustomerVal, setEditCustomerVal] = useState<string>('')

  // Estado del Modal de Descuentos (Pestaña: 'auto' | 'manual')
  const [discountTab, setDiscountTab] = useState<'auto' | 'manual'>('auto')
  const [promoName, setPromoName] = useState<string>('Cervezas más económicas hasta las 10 PM')
  const [promoCategory, setPromoCategory] = useState<string>('Cervezas')
  const [promoProductId, setPromoProductId] = useState<string>('')
  const [promoDiscountType, setPromoDiscountType] = useState<'fixed_off' | 'percentage' | 'fixed_price'>('fixed_off')
  const [promoDiscountValue, setPromoDiscountValue] = useState<number>(2000)
  const [promoDays, setPromoDays] = useState<number[]>([4, 5, 6]) // Jue, Vie, Sáb por defecto
  const [promoStartTime, setPromoStartTime] = useState<string>('16:00')
  const [promoEndTime, setPromoEndTime] = useState<string>('22:00') // 10:00 PM

  // Estado Descuento Manual a la Comanda
  const [manualType, setManualType] = useState<'percentage' | 'fixed_off' | 'fixed_price'>('percentage')
  const [manualValue, setManualValue] = useState<number>(10)
  const [manualTargetProd, setManualTargetProd] = useState<string>('')

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

  const activePromosNow = promotions.filter((pr) => isPromotionActiveNow(pr))

  // Alternar día en el formulario de promo automática
  const handleToggleDay = (dayId: number) => {
    setPromoDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    )
  }

  // Crear nueva promoción automática (ej. Cervezas hasta las 10 PM)
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoName.trim() || promoDiscountValue <= 0) return

    addPromotionRule({
      name: promoName.trim(),
      category: promoCategory,
      productId: promoProductId || undefined,
      discountType: promoDiscountType,
      discountValue: Number(promoDiscountValue),
      daysOfWeek: promoDays,
      startTime: promoStartTime || '00:00',
      endTime: promoEndTime || '22:00',
      active: true,
    })

    setNotification(`¡Descuento automático "${promoName.trim()}" guardado y activado!`)
    setTimeout(() => setNotification(''), 4000)
  }

  // Aplicar descuento manual a la comanda actual
  const handleApplyManualDiscount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTableObj || currentOrder.length === 0 || manualValue <= 0) return

    applyManualDiscountToTable(
      currentTableObj.id,
      manualType,
      Number(manualValue),
      manualTargetProd || undefined
    )

    setShowDiscountsModal(false)
    setNotification(
      `¡Descuento (${
        manualType === 'percentage'
          ? `-${manualValue}%`
          : manualType === 'fixed_price'
          ? `Precio fijo $ ${manualValue.toLocaleString('es-CO')}`
          : `-$ ${manualValue.toLocaleString('es-CO')}`
      }) aplicado a ${currentTableObj.name}!`
    )
    setTimeout(() => setNotification(''), 4000)
  }

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

    const { finalPrice, appliedPromo } = getEffectiveProductPrice(prod, promotions)
    addItemToTable(selectedTableId, prod, 1)
    setNotification(
      appliedPromo
        ? `🍺 ¡"${prod.name}" agregado con promo ($ ${finalPrice.toLocaleString('es-CO')}) a ${currentTableObj?.name || 'Mesa'}!`
        : `¡"${prod.name}" ($ ${finalPrice.toLocaleString('es-CO')}) agregado a ${currentTableObj?.name || 'Mesa'}!`
    )
    setTimeout(() => setNotification(''), 3000)
  }

  // Modificar cantidad en la comanda (+ o -) en la fila específica (con o sin descuento)
  const handleUpdateQty = (productId: string, delta: number, unitPrice?: number) => {
    updateTableItemQty(selectedTableId, productId, delta, unitPrice)
  }

  // Eliminar una fila específica de la orden
  const handleRemoveItem = (productId: string, productName: string, unitPrice?: number) => {
    removeTableItem(selectedTableId, productId, unitPrice)
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón de Descuentos y Happy Hour Automático */}
          <button
            type="button"
            onClick={() => {
              setDiscountTab('auto')
              setShowDiscountsModal(true)
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 border transition-all cursor-pointer active:scale-95 ${
              activePromosNow.length > 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-950/50'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>
              {activePromosNow.length > 0
                ? `🍺 Descuento Activo (${activePromosNow.length})`
                : 'Descuentos / Happy Hour'}
            </span>
          </button>

          {/* Notificación Toast reactiva */}
          {notification && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </div>
          )}
        </div>
      </div>

      {/* Banner en vivo cuando hay un descuento automático activo (ej. Cervezas hasta las 10 PM) */}
      {activePromosNow.length > 0 && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-300">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Promoción Automática Activa:</strong>{' '}
              {activePromosNow.map((p) => `${p.name} (hasta ${p.endTime})`).join(' • ')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setDiscountTab('auto')
              setShowDiscountsModal(true)
            }}
            className="text-emerald-400 hover:text-white font-bold underline cursor-pointer"
          >
            Configurar →
          </button>
        </div>
      )}

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
              const { finalPrice, originalPrice, appliedPromo } = getEffectiveProductPrice(p, promotions)
              const hasPromo = Boolean(appliedPromo && finalPrice < originalPrice)

              return (
                <div
                  key={p.id}
                  className={`rock-card p-3.5 rounded-xl flex flex-col justify-between min-h-[156px] relative transition-all group ${
                    isDisabled
                      ? 'opacity-60 border-zinc-800/50'
                      : hasPromo
                      ? 'border-emerald-500/50 hover:border-emerald-400 hover:bg-zinc-900/90'
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
                        {isInactive ? 'Pausado' : `Total: ${p.stock}`}
                      </span>
                    </div>
                    <p className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                      {p.name}
                    </p>

                    {/* Desglose Nevera / Bodega para personal */}
                    {!isInactive && (
                      <div className="flex items-center space-x-1.5 mt-1 text-[9px] font-semibold">
                        <span
                          className={`px-1.5 py-0.5 rounded border flex items-center space-x-1 ${
                            (p.stock_nevera ?? p.stock) <= (p.min_stock_nevera ?? 6)
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold'
                              : 'bg-zinc-800 text-cyan-300 border-zinc-700'
                          }`}
                        >
                          <span>❄️ {p.stock_nevera ?? p.stock} frías</span>
                        </span>
                        <span className="text-zinc-400">
                          📦 {p.stock_bodega ?? 0}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between mb-2">
                      {hasPromo ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black text-emerald-400">{formatCOP(finalPrice)}</span>
                          <span className="text-[10px] text-zinc-500 line-through">{formatCOP(originalPrice)}</span>
                          <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            PROMO
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-black text-white">{formatCOP(p.price)}</span>
                      )}
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
            <div
              key={`empty-order-${selectedTableId}`}
              className="text-center py-10 text-zinc-500 bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800/80 p-4"
            >
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50 text-zinc-400" />
              <p className="text-xs font-bold text-zinc-300">La comanda de {currentTableObj?.name || 'esta mesa'} está vacía</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Haz clic en el botón <span className="text-amber-400 font-bold">+ Agregar</span> de cualquier producto a la izquierda.
              </p>
            </div>
          ) : (
            <div
              key={`order-list-${selectedTableId}-${currentTableObj?.openedAt || 'open'}`}
              translate="no"
              className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1"
            >
              {currentOrder.map((it: OrderItemState, idx: number) => (
                <div
                  key={`${selectedTableId}-${it.productId}-${it.unitPrice}-${idx}`}
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
                        onClick={() => handleUpdateQty(it.productId, -1, it.unitPrice)}
                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                        title="Restar 1 unidad"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-white text-xs px-1.5">{it.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(it.productId, 1, it.unitPrice)}
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
                      onClick={() => handleRemoveItem(it.productId, it.name, it.unitPrice)}
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
              <div className="flex items-center space-x-2">
                {currentOrder.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountTab('manual')
                      setShowDiscountsModal(true)
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    <span>Aplicar Descuento</span>
                  </button>
                )}
                <span>{formatCOP(totalAmount)}</span>
              </div>
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

      {/* ========================================================================= */}
      {/* MODAL: DESCUENTOS AUTOMÁTICOS (HAPPY HOUR HASTA 10 PM) Y DESCUENTO MANUAL */}
      {/* ========================================================================= */}
      {showDiscountsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="rock-card w-full max-w-xl p-6 rounded-3xl border border-amber-500/40 shadow-2xl relative space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">Descuentos & Promociones</h3>
                  <p className="text-xs text-zinc-400">
                    Programa cervezas más económicas ciertos días hasta las 10:00 PM o aplica un descuento directo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscountsModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas: Automático (Días y Hora) vs Manual (Mesa Actual) */}
            <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setDiscountTab('auto')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  discountTab === 'auto'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🍺 Descuento Automático (Días / Hasta 10 PM)
              </button>
              <button
                type="button"
                onClick={() => setDiscountTab('manual')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  discountTab === 'manual'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🏷️ Descuento Manual a {currentTableObj?.name || 'Mesa'}
              </button>
            </div>

            {discountTab === 'auto' ? (
              <div className="space-y-4">
                <form onSubmit={handleCreatePromo} className="space-y-3 bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                      + Nueva Regla de Descuento Automático
                    </h4>
                    <span className="text-[11px] text-zinc-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Se activa sola según día y hora</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        Nombre de la Promoción *
                      </label>
                      <input
                        type="text"
                        required
                        value={promoName}
                        onChange={(e) => setPromoName(e.target.value)}
                        placeholder="Ej. Cervezas más económicas hasta las 10 PM"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        Categoría
                      </label>
                      <select
                        value={promoCategory}
                        onChange={(e) => {
                          setPromoCategory(e.target.value)
                          setPromoProductId('')
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Cervezas">🍺 Todas las Cervezas</option>
                        <option value="Licores">🥃 Licores</option>
                        <option value="Cócteles">🍸 Cócteles</option>
                        <option value="Snacks">🍔 Snacks</option>
                        <option value="Sin Alcohol">🥤 Sin Alcohol</option>
                        <option value="all">🔥 Todo el Catálogo</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        Producto Específico (Opcional)
                      </label>
                      <select
                        value={promoProductId}
                        onChange={(e) => setPromoProductId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Aplicar a toda la categoría ({promoCategory})</option>
                        {productList
                          .filter((p) => promoCategory === 'all' || p.category.toLowerCase() === promoCategory.toLowerCase())
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatCOP(p.price)})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        Tipo de Rebaja
                      </label>
                      <select
                        value={promoDiscountType}
                        onChange={(e) =>
                          setPromoDiscountType(e.target.value as 'fixed_off' | 'percentage' | 'fixed_price')
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="fixed_off">Rebajar valor en pesos ($ menos)</option>
                        <option value="percentage">Porcentaje de descuento (%)</option>
                        <option value="fixed_price">Dejar a precio fijo especial ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        {promoDiscountType === 'percentage'
                          ? 'Porcentaje (%) a descontar'
                          : promoDiscountType === 'fixed_price'
                          ? 'Precio fijo hasta las 10 PM ($)'
                          : 'Pesos a descontar por unidad ($)'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={promoDiscountValue}
                        onChange={(e) => setPromoDiscountValue(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Selección de Días */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                      Días en que aplica el descuento:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DAYS_LIST.map((d) => {
                        const selected = promoDays.includes(d.id)
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleToggleDay(d.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              selected
                                ? 'bg-amber-500 text-black border-amber-400'
                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                            }`}
                          >
                            {d.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Rango de Horas (Por defecto hasta las 22:00 / 10:00 PM) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        Hora de Inicio
                      </label>
                      <input
                        type="time"
                        value={promoStartTime}
                        onChange={(e) => setPromoStartTime(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        Hora Límite (Ej. 22:00 = 10:00 PM)
                      </label>
                      <input
                        type="time"
                        value={promoEndTime}
                        onChange={(e) => setPromoEndTime(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-extrabold text-black bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    + Guardar y Activar Descuento Automático
                  </button>
                </form>

                {/* Lista de Descuentos Programados */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Promociones Configuradas ({promotions.length})
                  </h4>

                  {promotions.length === 0 ? (
                    <p className="text-xs text-zinc-500 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 text-center">
                      No hay promociones automáticas creadas todavía. Usa el formulario de arriba para programar el descuento de cervezas hasta las 10:00 PM.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {promotions.map((pr) => {
                        const isRunningNow = isPromotionActiveNow(pr)
                        const dayNames = DAYS_LIST.filter((d) => pr.daysOfWeek.includes(d.id))
                          .map((d) => d.label)
                          .join(', ')

                        return (
                          <div
                            key={pr.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                              isRunningNow
                                ? 'bg-emerald-950/20 border-emerald-500/40'
                                : 'bg-zinc-950/80 border-zinc-800'
                            }`}
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white">{pr.name}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isRunningNow
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : pr.active
                                      ? 'bg-amber-500/15 text-amber-300'
                                      : 'bg-zinc-800 text-zinc-500'
                                  }`}
                                >
                                  {isRunningNow ? '🟢 Aplicando ahora' : pr.active ? '⏰ Programado' : 'Pausado'}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-0.5">
                                {pr.category} •{' '}
                                {pr.discountType === 'percentage'
                                  ? `-${pr.discountValue}%`
                                  : pr.discountType === 'fixed_price'
                                  ? `Precio fijo ${formatCOP(pr.discountValue)}`
                                  : `-${formatCOP(pr.discountValue)} por unidad`}{' '}
                                • {dayNames || 'Todos los días'} ({pr.startTime} a {pr.endTime})
                              </p>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleForcePromotionNow(pr.id)}
                                title="Forzar activación inmediata sin importar la hora actual"
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                                  pr.forceActiveNow
                                    ? 'bg-emerald-500 text-black border-emerald-400'
                                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-emerald-500'
                                }`}
                              >
                                <Zap className="w-3 h-3 inline mr-1" />
                                {pr.forceActiveNow ? 'Forzado ON' : 'Activar Ya'}
                              </button>
                              <button
                                type="button"
                                onClick={() => togglePromotionRule(pr.id)}
                                title={pr.active ? 'Pausar regla' : 'Habilitar regla'}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer"
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePromotionRule(pr.id)}
                                title="Eliminar promoción"
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/50 text-zinc-400 hover:text-red-400 border border-zinc-800 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Pestaña Descuento Manual a la Mesa Actual */
              <form onSubmit={handleApplyManualDiscount} className="space-y-4 bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1">
                    Aplicar Descuento Inmediato a {currentTableObj?.name || 'Mesa Actual'}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Rebaja los precios de los productos que ya están cargados en la comanda actual.
                  </p>
                </div>

                {currentOrder.length === 0 ? (
                  <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                    La comanda de {currentTableObj?.name || 'esta mesa'} está vacía. Primero agrega productos a la mesa para aplicar un descuento manual, o usa la pestaña de <strong>Descuento Automático</strong>.
                  </p>
                ) : (
                  <>
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        ¿A qué ítems de la mesa aplicar?
                      </label>
                      <select
                        value={manualTargetProd}
                        onChange={(e) => setManualTargetProd(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="">A todos los productos de la comanda ({currentOrder.length} ítems)</option>
                        {currentOrder.map((it, idx) => (
                          <option key={`${it.productId}-${it.unitPrice}-${idx}`} value={`${it.productId}__${it.unitPrice}`}>
                            Solo a: {it.name} ({it.quantity} x {formatCOP(it.unitPrice)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                          Tipo de Descuento
                        </label>
                        <select
                          value={manualType}
                          onChange={(e) => setManualType(e.target.value as 'percentage' | 'fixed_off' | 'fixed_price')}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="percentage">Porcentaje (%)</option>
                          <option value="fixed_off">Rebajar por unidad ($ menos)</option>
                          <option value="fixed_price">Precio fijo por unidad ($)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                          {manualType === 'percentage'
                            ? 'Porcentaje (%)'
                            : manualType === 'fixed_price'
                            ? 'Nuevo precio unitario ($)'
                            : 'Descuento por unidad ($)'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={manualValue}
                          onChange={(e) => setManualValue(Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Botones rápidos */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setManualType('percentage')
                          setManualValue(10)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
                      >
                        -10%
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualType('fixed_off')
                          setManualValue(1000)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
                      >
                        -$ 1.000 c/u
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualType('fixed_off')
                          setManualValue(1500)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
                      >
                        -$ 1.500 c/u
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualType('fixed_off')
                          setManualValue(2000)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
                      >
                        -$ 2.000 c/u
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-extrabold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
                    >
                      Aplicar Descuento a {currentTableObj?.name}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
