'use client'

import { useState } from 'react'
import { Package, Plus, Search, AlertTriangle, CheckCircle, Trash2, X, PlusCircle, MinusCircle, Check } from 'lucide-react'
import { useBarStore, addProductItem, deleteProductItem, adjustProductStock, ProductState } from '@/lib/barState'

export default function ProductosPage() {
  const barData = useBarStore()
  const products = barData.products || []

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showModal, setShowModal] = useState<boolean>(false)
  const [notification, setNotification] = useState<string>('')

  // Formulario nuevo producto
  const [formName, setFormName] = useState<string>('')
  const [formCategory, setFormCategory] = useState<string>('Cervezas')
  const [formPrice, setFormPrice] = useState<number>(12000)
  const [formCost, setFormCost] = useState<number>(6000)
  const [formStock, setFormStock] = useState<number>(24)
  const [formMinStock, setFormMinStock] = useState<number>(10)
  const [formBarcode, setFormBarcode] = useState<string>('')

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'Cervezas', name: 'Cervezas' },
    { id: 'Licores', name: 'Licores' },
    { id: 'Cócteles', name: 'Cócteles' },
    { id: 'Snacks', name: 'Snacks' },
    { id: 'Sin Alcohol', name: 'Sin Alcohol' },
  ]

  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')

  // Crear nuevo producto
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || formPrice <= 0) return

    const newProd = addProductItem({
      name: formName.trim(),
      category: formCategory,
      price: formPrice,
      cost: formCost,
      stock: formStock,
      min_stock: formMinStock,
      barcode: formBarcode.trim() || 'SKU-' + Math.floor(100000 + Math.random() * 900000),
    })

    setShowModal(false)
    setFormName('')
    setFormPrice(12000)
    setFormCost(6000)
    setFormStock(24)
    setFormMinStock(10)
    setFormBarcode('')

    setNotification(`¡Producto "${newProd.name}" creado con éxito y disponible para ventas!`)
    setTimeout(() => setNotification(''), 4500)
  }

  // Eliminar producto
  const handleDeleteProduct = (p: ProductState) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${p.name}" del catálogo?`)) {
      deleteProductItem(p.id)
      setNotification(`Producto "${p.name}" eliminado del catálogo.`)
      setTimeout(() => setNotification(''), 4000)
    }
  }

  // Ajustar stock
  const handleStockChange = (id: string, name: string, delta: number) => {
    adjustProductStock(id, delta)
    setNotification(`Stock de "${name}" ${delta > 0 ? 'incrementado' : 'reducido'} (${delta > 0 ? '+' : ''}${delta}).`)
    setTimeout(() => setNotification(''), 3000)
  }

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category.toLowerCase().includes(activeCategory.toLowerCase())
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery))
    return matchesCat && matchesQuery
  })

  const totalStockItems = products.reduce((acc, p) => acc + (p.stock || 0), 0)
  const lowStockCount = products.filter((p) => p.stock <= p.min_stock).length

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <Package className="w-4 h-4" />
            <span>Inventario & Catálogo Activo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Catálogo de Productos
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Crea nuevos productos, elimina artículos descontinuados y gestiona existencias en tiempo real.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Notificación si existe */}
      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Métricas Rápidas del Catálogo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rock-card p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Productos</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{products.length}</p>
          <span className="text-[11px] text-zinc-500">En catálogo activo</span>
        </div>
        <div className="rock-card p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Unidades Físicas</p>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{totalStockItems}</p>
          <span className="text-[11px] text-zinc-500">Stock total</span>
        </div>
        <div className="rock-card p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Alertas de Stock</p>
          <p className={`text-xl sm:text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
            {lowStockCount}
          </p>
          <span className="text-[11px] text-zinc-500">Por debajo del mínimo</span>
        </div>
        <div className="rock-card p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Categorías</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">5</p>
          <span className="text-[11px] text-zinc-500">Licores, birras, snacks...</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre de producto o SKU..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Píldoras de Categorías */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const isLowStock = p.stock <= p.min_stock
          const margin = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0

          return (
            <div
              key={p.id}
              className={`rock-card p-5 rounded-2xl transition-all relative overflow-hidden group hover:border-red-600/70 ${
                isLowStock ? 'border-amber-500/50' : ''
              }`}
            >
              {/* Badge superior y botón eliminar */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/60">
                  {p.category}
                </span>

                <div className="flex items-center space-x-1.5">
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

                  <button
                    onClick={() => handleDeleteProduct(p)}
                    title="Eliminar este producto del catálogo"
                    className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Título */}
              <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-400 transition-colors mb-1">
                {p.name}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono mb-4">SKU: {p.barcode || 'N/A'}</p>

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

              {/* Ajustador de Stock en Vivo */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
                <div>
                  <span className="text-zinc-400">Stock: </span>
                  <strong className={isLowStock ? 'text-amber-400 font-black' : 'text-zinc-200'}>
                    {p.stock} uds
                  </strong>
                  <span className="text-[10px] text-zinc-500 ml-1">(mín: {p.min_stock})</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStockChange(p.id, p.name, -1)}
                    title="Restar 1 unidad"
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStockChange(p.id, p.name, 1)}
                    title="Sumar 1 unidad"
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStockChange(p.id, p.name, 10)}
                    title="Sumar paquete (+10 uds)"
                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-amber-400 cursor-pointer"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal / Formulario para Crear Nuevo Producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-lg p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Registrar Nuevo Producto</h3>
                  <p className="text-xs text-zinc-400">Se agregará al catálogo y al punto de venta</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Cerveza Artesanal IPA 330ml, Tequila Don Julio..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Categoría *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="Cervezas">Cervezas</option>
                    <option value="Licores">Licores & Botellas</option>
                    <option value="Cócteles">Cócteles</option>
                    <option value="Snacks">Snacks & Comida</option>
                    <option value="Sin Alcohol">Sin Alcohol</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Código / SKU</label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="Ej. 7701239999"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Precio Venta (COP) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    step={100}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Costo Compra (COP) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Stock Inicial (unidades)</label>
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min={0}
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
