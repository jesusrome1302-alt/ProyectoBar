'use client'

import { useState } from 'react'
import GulpDeleteButton from '@/components/GulpDeleteButton'
import { confirmAction } from '@/lib/dialogService'
import {
  Package,
  Plus,
  Minus,
  Search,
  AlertTriangle,
  CheckCircle,
  X,
  PlusCircle,
  MinusCircle,
  Truck,
  FileSpreadsheet,
  History,
  Building2,
  Phone,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  AlertCircle,
  Edit2,
  Power,
  Sparkles,
  Snowflake,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import {
  useBarStore,
  addProductItem,
  updateProductItem,
  toggleProductActive,
  deleteProductItem,
  adjustProductStock,
  transferStockToNevera,
  addSupplier,
  deleteSupplier,
  registerPurchase,
  registerInventoryAdjustment,
  loadSuggestedProductsTemplate,
  addCategory,
  deleteCategory,
  DEFAULT_CATEGORIES,
  ProductState,
  SupplierState,
  PurchaseRecord,
  InventoryMovementRecord,
} from '@/lib/barState'

export default function ProductosPage() {
  const barData = useBarStore()
  const products = barData.products || []
  const suppliers = barData.suppliers || []
  const purchases = barData.purchases || []
  const inventoryMovements = barData.inventoryMovements || []

  // Pestaña activa: 'catalogo' | 'compras' | 'proveedores' | 'kardex'
  const [activeTab, setActiveTab] = useState<'catalogo' | 'compras' | 'proveedores' | 'kardex'>('catalogo')

  // Notificación
  const [notification, setNotification] = useState<string>('')

  // Filtros del catálogo
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modales
  const [showProductModal, setShowProductModal] = useState<boolean>(false)
  const [showEditProductModal, setShowEditProductModal] = useState<boolean>(false)
  const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState<boolean>(false)
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false)

  // Formulario Nueva Categoría
  const [newCategoryName, setNewCategoryName] = useState<string>('')
  const [newCategoryIcon, setNewCategoryIcon] = useState<string>('🍸')

  // Formulario Nuevo Producto
  const [formName, setFormName] = useState<string>('')
  const [formCategory, setFormCategory] = useState<string>('Cervezas')
  const [formPrice, setFormPrice] = useState<number>(12000)
  const [formCost, setFormCost] = useState<number>(6000)
  const [formStockNevera, setFormStockNevera] = useState<number>(12)
  const [formStockBodega, setFormStockBodega] = useState<number>(12)
  const [formMinStockNevera, setFormMinStockNevera] = useState<number>(6)
  const [formMinStock, setFormMinStock] = useState<number>(10)
  const [formBarcode, setFormBarcode] = useState<string>('')

  // Formulario Editar Producto
  const [editingProductId, setEditingProductId] = useState<string>('')
  const [editName, setEditName] = useState<string>('')
  const [editCategory, setEditCategory] = useState<string>('Cervezas')
  const [editPrice, setEditPrice] = useState<number>(12000)
  const [editCost, setEditCost] = useState<number>(6000)
  const [editStockNevera, setEditStockNevera] = useState<number>(12)
  const [editStockBodega, setEditStockBodega] = useState<number>(12)
  const [editMinStockNevera, setEditMinStockNevera] = useState<number>(6)
  const [editMinStock, setEditMinStock] = useState<number>(10)
  const [editBarcode, setEditBarcode] = useState<string>('')
  const [editActive, setEditActive] = useState<boolean>(true)

  // Modal Transferencia Nevera (Reabastecer de Bodega)
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false)
  const [transferProduct, setTransferProduct] = useState<ProductState | null>(null)
  const [transferQty, setTransferQty] = useState<number>(12)

  // Modal Ajuste Rápido de Stock (Selecciona hacia dónde va: Nevera o Bodega)
  const [showQuickAdjustModal, setShowQuickAdjustModal] = useState<boolean>(false)
  const [quickAdjustProduct, setQuickAdjustProduct] = useState<ProductState | null>(null)
  const [quickAdjustQty, setQuickAdjustQty] = useState<number>(10)
  const [quickAdjustSign, setQuickAdjustSign] = useState<1 | -1>(1)

  // Formulario Nuevo Proveedor
  const [supName, setSupName] = useState<string>('')
  const [supCategory, setSupCategory] = useState<string>('Cervezas & Maltas')
  const [supContact, setSupContact] = useState<string>('')
  const [supPhone, setSupPhone] = useState<string>('')
  const [supEmail, setSupEmail] = useState<string>('')
  const [supLeadTime, setSupLeadTime] = useState<string>('24 a 48 horas')
  const [supTerms, setSupTerms] = useState<string>('Contado / Crédito 15 días')
  const [supAddress, setSupAddress] = useState<string>('')

  // Formulario Nueva Orden de Compra
  const [purchaseSupplierId, setPurchaseSupplierId] = useState<string>(suppliers[0]?.id || '')
  const [purchaseInvoice, setPurchaseInvoice] = useState<string>('')
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState<'Efectivo Caja' | 'Transferencia' | 'Crédito'>('Transferencia')
  const [purchaseNotes, setPurchaseNotes] = useState<string>('')
  const [purchaseItems, setPurchaseItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([
    { productId: products[0]?.id || '', quantity: 24, unitCost: products[0]?.cost || 6000 },
  ])

  // Formulario Ajuste / Merma de Inventario
  const [adjProductId, setAdjProductId] = useState<string>(products[0]?.id || '')
  const [adjType, setAdjType] = useState<'loss' | 'adjustment'>('loss')
  const [adjQuantity, setAdjQuantity] = useState<number>(1)
  const [adjReason, setAdjReason] = useState<string>('Botella rota durante servicio')

  const lowNeveraList = products.filter((p) => {
    const nev = p.stock_nevera ?? p.stock ?? 0
    const minNev = p.min_stock_nevera ?? Math.max(2, Math.floor((p.min_stock || 10) / 2))
    return nev <= minNev
  })
  const lowNeveraCount = lowNeveraList.length
  const firstLowNevera = lowNeveraList.find((p) => (p.stock_bodega ?? 0) > 0) || lowNeveraList[0] || null

  const lowBodegaList = products.filter((p) => {
    const bod = p.stock_bodega ?? 0
    const minNev = p.min_stock_nevera ?? Math.max(2, Math.floor((p.min_stock || 10) / 2))
    const minBod = Math.max(1, (p.min_stock || 10) - minNev)
    return bod <= 0 || bod <= minBod || (p.stock ?? 0) <= (p.min_stock || 10)
  })
  const lowBodegaCount = lowBodegaList.length
  const firstLowBodega = lowBodegaList[0] || null

  const barCategories = barData.categories && barData.categories.length > 0 ? barData.categories : DEFAULT_CATEGORIES

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'low_nevera', name: `❄️ Reponer Nevera (${lowNeveraCount})` },
    { id: 'low_bodega', name: `📦 Reponer Bodega (${lowBodegaCount})` },
    ...barCategories.map((c) => ({ id: c.name, name: `${c.icon ? c.icon + ' ' : ''}${c.name}` })),
  ]

  // Crear nueva categoría personalizada del negocio
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    const created = addCategory(newCategoryName.trim(), newCategoryIcon)
    setNewCategoryName('')
    setFormCategory(created.name)
    setNotification(`¡Categoría "${created.icon || ''} ${created.name}" creada para tu negocio!`)
    setTimeout(() => setNotification(''), 4000)
  }

  const confirmDeleteCategory = async (name: string) => {
    return await confirmAction({
      title: `¿Eliminar la categoría "${name}"?`,
      message: `Esta categoría se removerá de tu lista. Los productos existentes que pertenezcan a ella seguirán existiendo en tu inventario.`,
      confirmText: 'Sí, eliminar categoría',
      cancelText: 'Cancelar',
      variant: 'danger',
      badgeText: 'Eliminación de Categoría',
    })
  }

  const handleDeleteCategory = (id: string, name: string) => {
    if (deleteCategory(id)) {
      if (activeCategory === name) setActiveCategory('all')
      setNotification(`Categoría "${name}" eliminada.`)
      setTimeout(() => setNotification(''), 3500)
    }
  }

  const formatCOP = (val: number) => '$ ' + Math.abs(val).toLocaleString('es-CO')

  // Manejar creación de producto con inventario dual
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || formPrice <= 0) return

    const stockNevera = Number(formStockNevera) || 0
    const stockBodega = Number(formStockBodega) || 0
    const totalStock = stockNevera + stockBodega
    const minNevera = Number(formMinStockNevera) || 6

    const newProd = addProductItem({
      name: formName.trim(),
      category: formCategory,
      price: formPrice,
      cost: formCost,
      stock: totalStock,
      stock_nevera: stockNevera,
      stock_bodega: stockBodega,
      min_stock_nevera: minNevera,
      min_stock: formMinStock,
      barcode: formBarcode.trim() || 'SKU-' + Math.floor(100000 + Math.random() * 900000),
    })

    setShowProductModal(false)
    setFormName('')
    setFormPrice(12000)
    setFormCost(6000)
    setFormStockNevera(12)
    setFormStockBodega(12)
    setFormMinStockNevera(6)
    setFormMinStock(10)
    setFormBarcode('')

    setNotification(`¡"${newProd.name}" registrado con ${stockNevera} uds en Nevera y ${stockBodega} uds en Bodega (Total: ${totalStock})!`)
    setTimeout(() => setNotification(''), 4500)
  }

  // Abrir modal de edición con datos del producto
  const openEditProduct = (p: ProductState) => {
    setEditingProductId(p.id)
    setEditName(p.name)
    setEditCategory(p.category)
    setEditPrice(p.price)
    setEditCost(p.cost)
    const nev = p.stock_nevera !== undefined ? p.stock_nevera : p.stock
    const bod = p.stock_bodega !== undefined ? p.stock_bodega : 0
    const minNev = p.min_stock_nevera !== undefined ? p.min_stock_nevera : Math.max(2, Math.floor(p.min_stock / 2))
    setEditStockNevera(nev)
    setEditStockBodega(bod)
    setEditMinStockNevera(minNev)
    setEditMinStock(p.min_stock)
    setEditBarcode(p.barcode || '')
    setEditActive(p.active !== false)
    setShowEditProductModal(true)
  }

  // Guardar cambios del producto editado
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProductId || !editName.trim() || editPrice <= 0) return

    const total = editStockNevera + editStockBodega

    updateProductItem(editingProductId, {
      name: editName.trim(),
      category: editCategory,
      price: editPrice,
      cost: editCost,
      stock: total,
      stock_nevera: editStockNevera,
      stock_bodega: editStockBodega,
      min_stock_nevera: editMinStockNevera,
      min_stock: editMinStock,
      barcode: editBarcode.trim(),
      active: editActive,
    })

    setShowEditProductModal(false)
    setNotification(`¡"${editName.trim()}" actualizado! Nevera: ${editStockNevera} | Bodega: ${editStockBodega} | Total: ${total} uds`)
    setTimeout(() => setNotification(''), 4000)
  }

  // Abrir modal de transferencia de bodega a nevera
  const openTransferModal = (p: ProductState) => {
    setTransferProduct(p)
    const availableBodega = p.stock_bodega ?? 0
    setTransferQty(Math.min(12, availableBodega > 0 ? availableBodega : 1))
    setShowTransferModal(true)
  }

  // Confirmar transferencia a nevera
  const handleConfirmTransfer = () => {
    if (!transferProduct || transferQty <= 0) return
    const success = transferStockToNevera(transferProduct.id, transferQty)
    if (success) {
      setNotification(`❄️ ¡${transferQty} unidades de "${transferProduct.name}" pasadas a la Nevera con éxito!`)
      setShowTransferModal(false)
      setTransferProduct(null)
      setTimeout(() => setNotification(''), 4500)
    } else {
      setNotification(`⚠️ No se pudo transferir: stock insuficiente en bodega.`)
      setTimeout(() => setNotification(''), 3500)
    }
  }

  // Alternar estado activo / pausado
  const handleToggleActive = (p: ProductState) => {
    toggleProductActive(p.id)
    const nextStateMsg = p.active === false ? 'activado para venta en POS' : 'pausado temporalmente'
    setNotification(`Producto "${p.name}" ${nextStateMsg}.`)
    setTimeout(() => setNotification(''), 3500)
  }

  // Manejar eliminación de producto (tras animación del bote comiéndose la etiqueta)
  const handleDeleteProduct = (p: ProductState) => {
    deleteProductItem(p.id)
    setNotification(`🗑️ Producto "${p.name}" eliminado del catálogo.`)
    setTimeout(() => setNotification(''), 4000)
  }

  // Abrir modal de ajuste rápido de stock (pregunta hacia dónde va: Nevera o Bodega)
  const openQuickAdjustModal = (p: ProductState, initialDelta: number) => {
    setQuickAdjustProduct(p)
    setQuickAdjustSign(initialDelta >= 0 ? 1 : -1)
    setQuickAdjustQty(Math.max(1, Math.abs(initialDelta)))
    setShowQuickAdjustModal(true)
  }

  // Confirmar y guardar ajuste rápido en Nevera o Bodega
  const handleConfirmQuickAdjust = (target: 'nevera' | 'bodega') => {
    if (!quickAdjustProduct || quickAdjustQty <= 0) return
    const signedDelta = quickAdjustSign * quickAdjustQty
    adjustProductStock(quickAdjustProduct.id, signedDelta, target)
    const targetName = target === 'nevera' ? '❄️ Nevera (Frías)' : '📦 Bodega (Reserva)'
    setNotification(
      `¡Ajuste guardado! ${signedDelta > 0 ? `+${signedDelta}` : signedDelta} uds de "${quickAdjustProduct.name}" aplicadas en ${targetName}.`
    )
    setShowQuickAdjustModal(false)
    setQuickAdjustProduct(null)
    setTimeout(() => setNotification(''), 4000)
  }

  // Manejar creación de proveedor
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supName.trim()) return

    const newSup = addSupplier({
      name: supName.trim(),
      category: supCategory,
      contactName: supContact.trim() || 'Asesor Comercial',
      phone: supPhone.trim() || '+57 300 000 0000',
      email: supEmail.trim(),
      leadTime: supLeadTime,
      paymentTerms: supTerms,
      address: supAddress.trim(),
    })

    setShowSupplierModal(false)
    setSupName('')
    setSupContact('')
    setSupPhone('')
    setSupEmail('')
    setSupAddress('')
    setNotification(`¡Proveedor "${newSup.name}" registrado en el directorio!`)
    setTimeout(() => setNotification(''), 4000)
  }

  // Manejar eliminación de proveedor (tras animación del bote comiéndose la etiqueta)
  const handleDeleteSupplier = (s: SupplierState) => {
    deleteSupplier(s.id)
    setNotification(`🗑️ Proveedor "${s.name}" eliminado.`)
    setTimeout(() => setNotification(''), 3500)
  }

  // Manejar registro de orden de compra
  const handleRegisterPurchase = (e: React.FormEvent) => {
    e.preventDefault()
    const supplierObj = suppliers.find((s) => s.id === purchaseSupplierId) || suppliers[0]
    if (!supplierObj) return

    const validItems = purchaseItems
      .filter((it) => it.quantity > 0 && it.productId)
      .map((it) => {
        const prod = products.find((p) => p.id === it.productId)
        return {
          productId: it.productId,
          productName: prod?.name || 'Producto',
          quantity: it.quantity,
          unitCost: it.unitCost,
          subtotal: it.quantity * it.unitCost,
        }
      })

    if (validItems.length === 0) return

    const totalAmount = validItems.reduce((acc, it) => acc + it.subtotal, 0)

    const newPurchase = registerPurchase({
      supplierId: supplierObj.id,
      supplierName: supplierObj.name,
      invoiceNumber: purchaseInvoice.trim(),
      items: validItems,
      totalAmount,
      paymentMethod: purchasePaymentMethod,
      notes: purchaseNotes.trim(),
    })

    setShowPurchaseModal(false)
    setPurchaseInvoice('')
    setPurchaseNotes('')
    setPurchaseItems([{ productId: products[0]?.id || '', quantity: 24, unitCost: products[0]?.cost || 6000 }])
    setNotification(
      `¡Compra ${newPurchase.id} registrada con éxito! ${validItems.length} productos ingresados al inventario.`
    )
    setTimeout(() => setNotification(''), 4500)
  }

  // Manejar registro de merma / ajuste físico
  const handleRegisterAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjProductId || adjQuantity <= 0) return

    const prod = products.find((p) => p.id === adjProductId)
    const quantityDelta = adjType === 'loss' ? -adjQuantity : adjQuantity

    registerInventoryAdjustment(adjProductId, adjType, quantityDelta, adjReason.trim() || 'Ajuste manual de bodega')

    setShowAdjustmentModal(false)
    setAdjQuantity(1)
    setNotification(
      `¡Ajuste de inventario registrado para "${prod?.name || 'Producto'}": ${
        quantityDelta > 0 ? '+' : ''
      }${quantityDelta} unidades!`
    )
    setTimeout(() => setNotification(''), 4000)
  }

  // Filtrado de productos (incluye filtro por alerta de nevera baja o bodega baja)
  const filteredProducts = products.filter((p) => {
    let matchesCat = true
    if (activeCategory === 'low_nevera') {
      const nev = p.stock_nevera ?? p.stock ?? 0
      const minNev = p.min_stock_nevera ?? Math.max(2, Math.floor((p.min_stock || 10) / 2))
      matchesCat = nev <= minNev
    } else if (activeCategory === 'low_bodega') {
      const bod = p.stock_bodega ?? 0
      const minNev = p.min_stock_nevera ?? Math.max(2, Math.floor((p.min_stock || 10) / 2))
      const minBod = Math.max(1, (p.min_stock || 10) - minNev)
      matchesCat = bod <= 0 || bod <= minBod || (p.stock ?? 0) <= (p.min_stock || 10)
    } else if (activeCategory !== 'all') {
      matchesCat = p.category.toLowerCase().includes(activeCategory.toLowerCase())
    }
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery))
    return matchesCat && matchesQuery
  })

  // Métricas de inventario dual
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0)
  const totalNeveraUnits = products.reduce((acc, p) => acc + (p.stock_nevera ?? p.stock ?? 0), 0)
  const totalBodegaUnits = products.reduce((acc, p) => acc + (p.stock_bodega ?? 0), 0)
  const totalInventoryCost = products.reduce((acc, p) => acc + (p.stock || 0) * (p.cost || 0), 0)
  const totalInventoryRetail = products.reduce((acc, p) => acc + (p.stock || 0) * (p.price || 0), 0)
  const profitMargin = totalInventoryCost > 0
    ? Math.round(((totalInventoryRetail - totalInventoryCost) / totalInventoryCost) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <Boxes className="w-4 h-4" />
            <span>Gestión de Cadena de Suministro & Bodega • Operador Único</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Inventario, Compras & Proveedores
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Control de existencias físicas, órdenes de compra a proveedores, mermas y auditoría de bodega en tiempo real.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {activeTab === 'catalogo' && (
            <>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 hover:text-amber-300 font-bold px-3.5 py-2.5 rounded-xl transition-all text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Categorías ({barCategories.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo Producto</span>
              </button>
            </>
          )}

          {activeTab === 'compras' && (
            <button
              type="button"
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Compra</span>
            </button>
          )}

          {activeTab === 'proveedores' && (
            <button
              type="button"
              onClick={() => setShowSupplierModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-900/30 transition-all text-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Proveedor</span>
            </button>
          )}

          {activeTab === 'kardex' && (
            <button
              type="button"
              onClick={() => setShowAdjustmentModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-900/30 transition-all text-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajustar / Merma</span>
            </button>
          )}
        </div>
      </div>

      {/* Notificación Toast si existe */}
      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Pestañas de Navegación del Módulo */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab('catalogo')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'catalogo'
              ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catálogo de Productos ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compras')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'compras'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Compras & Reabastecimiento ({purchases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('proveedores')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'proveedores'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Directorio de Proveedores ({suppliers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kardex')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'kardex'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Kardex / Movimientos ({inventoryMovements.length})</span>
        </button>
      </div>

      {/* Métricas Globales de Inventario con Estilo Temático Dinámico y Alineación Simétrica */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. TOTAL EN SISTEMA (Live Digital HUD) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/90 via-[#0e131f] to-zinc-950 border border-zinc-800 p-4 flex flex-col justify-between min-h-[116px] shadow-xl hover:border-zinc-700 transition-all group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black tracking-wider uppercase text-zinc-400 flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="truncate">Total Sistema</span>
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/80 text-zinc-300 shrink-0">
              {products.length} refs
            </span>
          </div>

          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-2 tracking-tight relative z-10">
            {totalStockUnits} <span className="text-xs font-semibold text-zinc-400">uds</span>
          </p>

          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between relative z-10">
            <span className="truncate">Stock físico</span>
            {lowNeveraCount + lowBodegaCount > 0 ? (
              <span className="text-amber-400 font-bold text-[10px] shrink-0">
                ⚠️ {lowNeveraCount + lowBodegaCount} alerta(s)
              </span>
            ) : (
              <span className="text-emerald-400 font-bold text-[10px] shrink-0">✓ Abastecido</span>
            )}
          </div>
        </div>

        {/* 2. EN NEVERA (Frosted Ice / Sub-Zero Chamber - ¡Efecto Congelado!) */}
        <button
          type="button"
          onClick={() => setActiveCategory(activeCategory === 'low_nevera' ? 'all' : 'low_nevera')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#062338]/90 via-[#071927]/90 to-[#020b12] border border-cyan-400/50 shadow-[0_0_22px_rgba(6,182,212,0.25)] hover:shadow-[0_0_32px_rgba(34,211,238,0.4)] hover:border-cyan-300 p-4 flex flex-col justify-between min-h-[116px] text-left transition-all cursor-pointer group"
        >
          {/* Luz ambiental fría y escarcha */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black tracking-wider uppercase text-cyan-300 flex items-center space-x-1">
              <span>❄️ En Nevera</span>
            </span>
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 flex items-center space-x-1 shadow-sm shrink-0">
              <span>🧊 Bajo Cero</span>
            </span>
          </div>

          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-100 mt-2 tracking-tight drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] relative z-10">
            {totalNeveraUnits} <span className="text-xs font-semibold text-cyan-300">uds</span>
          </p>

          <div className="text-[11px] text-cyan-300/90 mt-1 flex items-center justify-between relative z-10">
            <span className="truncate">Listas para servir</span>
            {lowNeveraCount > 0 ? (
              <span className="text-amber-300 font-bold text-[10px] shrink-0">⚠️ {lowNeveraCount} baja(s)</span>
            ) : (
              <span className="text-cyan-200 font-bold text-[10px] shrink-0">✓ Frías</span>
            )}
          </div>
        </button>

        {/* 3. EN BODEGA (Almacén de Cajas + Alerta Dinámica cuando Bodega Baja o está en 0) */}
        <button
          type="button"
          onClick={() => setActiveCategory(activeCategory === 'low_bodega' ? 'all' : 'low_bodega')}
          className={`relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between min-h-[116px] text-left transition-all cursor-pointer group ${
            lowBodegaCount > 0
              ? 'bg-gradient-to-br from-amber-950/95 via-[#291507] to-red-950/80 border-2 border-amber-500 animate-siren'
              : 'bg-gradient-to-br from-[#24170d]/90 via-[#18110b]/90 to-[#0e0a07] border border-amber-600/40 shadow-[0_0_18px_rgba(245,158,11,0.18)] hover:border-amber-500 hover:shadow-[0_0_28px_rgba(245,158,11,0.3)]'
          }`}
        >
          {/* Franja de peligro si hay productos sin reserva en bodega */}
          {lowBodegaCount > 0 && (
            <div className="hazard-stripe h-1.5 w-full absolute top-0 left-0 right-0" />
          )}

          {/* Resplandor cálido de almacén */}
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black tracking-wider uppercase text-amber-300 flex items-center space-x-1">
              <span>{lowBodegaCount > 0 ? '🚨 En Bodega' : '📦 En Bodega'}</span>
            </span>
            {lowBodegaCount > 0 ? (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase tracking-wider flex items-center space-x-1 shadow-md animate-pulse shrink-0">
                <span>{totalBodegaUnits === 0 ? '¡Vacía!' : `${lowBodegaCount} Baja(s)`}</span>
              </span>
            ) : (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm shrink-0">
                Almacén
              </span>
            )}
          </div>

          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-200 mt-2 tracking-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] relative z-10">
            {totalBodegaUnits} <span className="text-xs font-semibold text-amber-400">uds</span>
          </p>

          <div className="text-[11px] text-amber-300/90 mt-1 flex items-center justify-between relative z-10">
            <span className="truncate">
              {lowBodegaCount > 0 ? `⚡ ${lowBodegaCount} por surtir` : 'Cajas de respaldo'}
            </span>
            <span className="text-[10px] font-bold underline decoration-dotted shrink-0">
              {activeCategory === 'low_bodega' ? 'Activo' : lowBodegaCount > 0 ? 'Filtrar' : '✓ Reserva'}
            </span>
          </div>
        </button>

        {/* 4. NEVERA BAJA (¡Alerta Dinámica & Sirena de Reposición Urgente!) */}
        <button
          type="button"
          onClick={() => setActiveCategory(activeCategory === 'low_nevera' ? 'all' : 'low_nevera')}
          className={`relative overflow-hidden rounded-2xl text-left transition-all cursor-pointer p-4 flex flex-col justify-between min-h-[116px] group ${
            lowNeveraCount > 0
              ? 'bg-gradient-to-br from-red-950/95 via-[#2b0c0c] to-amber-950/80 border-2 border-red-500 animate-siren'
              : 'bg-gradient-to-br from-emerald-950/30 via-zinc-950 to-[#0c1813] border border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          }`}
        >
          {/* Franja de peligro animada en la cabecera si hay alerta */}
          {lowNeveraCount > 0 && (
            <div className="hazard-stripe h-1.5 w-full absolute top-0 left-0 right-0" />
          )}

          <div className="flex items-center justify-between relative z-10">
            <span
              className={`text-[10px] font-black tracking-wider uppercase flex items-center space-x-1 ${
                lowNeveraCount > 0 ? 'text-red-300' : 'text-emerald-400'
              }`}
            >
              <span>{lowNeveraCount > 0 ? '🚨 Nevera Baja' : '✅ Neveras'}</span>
            </span>

            {lowNeveraCount > 0 ? (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wider flex items-center space-x-1 shadow-md shadow-red-950 animate-pulse shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>¡Reponer!</span>
              </span>
            ) : (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shrink-0">
                Al 100%
              </span>
            )}
          </div>

          <p
            className={`text-xl sm:text-2xl lg:text-3xl font-black mt-2 tracking-tight relative z-10 ${
              lowNeveraCount > 0
                ? 'text-red-300 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                : 'text-emerald-300'
            }`}
          >
            {lowNeveraCount}{' '}
            <span className="text-xs font-semibold opacity-80">
              {lowNeveraCount === 1 ? 'bebida' : 'bebidas'}
            </span>
          </p>

          <div
            className={`text-[11px] mt-1 flex items-center justify-between relative z-10 ${
              lowNeveraCount > 0 ? 'text-amber-300 font-bold' : 'text-zinc-400'
            }`}
          >
            <span className="truncate">{lowNeveraCount > 0 ? '⚡ Clic para reponer' : 'Sin faltantes en frío'}</span>
            <span className="text-[10px] opacity-75 underline decoration-dotted shrink-0">
              {activeCategory === 'low_nevera' ? 'Activo' : 'Filtrar'}
            </span>
          </div>
        </button>

        {/* 5. VALOR A VENTA (Cámara Acorazada & Margen Comercial) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-950/90 to-[#0a1812] border border-emerald-500/40 p-4 flex flex-col justify-between min-h-[116px] shadow-xl hover:border-emerald-400 hover:shadow-[0_0_24px_rgba(16,185,129,0.22)] transition-all col-span-2 sm:col-span-1 group">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400 flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Valor Venta</span>
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center space-x-0.5 shrink-0">
              <TrendingUp className="w-2.5 h-2.5 shrink-0" />
              <span>{profitMargin > 0 ? `+${profitMargin}%` : 'Margen'}</span>
            </span>
          </div>

          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-300 mt-2 tracking-tight relative z-10">
            {formatCOP(totalInventoryRetail)}
          </p>

          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between relative z-10">
            <span className="truncate">
              Costo: <strong className="text-zinc-300 font-semibold">{formatCOP(totalInventoryCost)}</strong>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold shrink-0">✓ Activo</span>
          </div>
        </div>
      </div>

      {/* Banners Urgentes cuando hay Nevera Baja o Bodega Baja / Vacía */}
      {(lowNeveraCount > 0 || lowBodegaCount > 0) && (
        <div className="space-y-2.5 animate-fadeIn">
          {lowNeveraCount > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-rose-950/40 to-amber-950/60 border-2 border-red-500/60 shadow-xl shadow-red-950/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 mt-0.5 sm:mt-0 animate-pulse">
                  <Snowflake className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wider">
                      ❄️ Alerta de Nevera
                    </span>
                    <p className="text-xs sm:text-sm font-black text-white">
                      {lowNeveraCount} {lowNeveraCount === 1 ? 'producto está' : 'productos están'} en nivel crítico de frío
                    </p>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5">
                    Pasa unidades de bodega a la nevera o ingresa unidades frías para no quedarte sin bebidas heladas.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === 'low_nevera' ? 'all' : 'low_nevera')}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
                >
                  {activeCategory === 'low_nevera' ? 'Ver Todo' : 'Filtrar Nevera'}
                </button>

                {firstLowNevera && (
                  <button
                    type="button"
                    onClick={() =>
                      (firstLowNevera.stock_bodega ?? 0) > 0
                        ? openTransferModal(firstLowNevera)
                        : openQuickAdjustModal(firstLowNevera, 12)
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-950/50 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Snowflake className="w-4 h-4" />
                    <span>
                      {(firstLowNevera.stock_bodega ?? 0) > 0
                        ? `Pasar ${firstLowNevera.name.split(' ')[0]} a Nevera`
                        : `Surtir ${firstLowNevera.name.split(' ')[0]}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {lowBodegaCount > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/85 via-stone-900/80 to-orange-950/60 border-2 border-amber-500/60 shadow-xl shadow-amber-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 sm:mt-0 animate-pulse">
                  <Boxes className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase tracking-wider">
                      📦 Alerta de Bodega
                    </span>
                    <p className="text-xs sm:text-sm font-black text-white">
                      {lowBodegaCount}{' '}
                      {lowBodegaCount === 1
                        ? 'producto tiene la Bodega agotada o con reserva baja'
                        : 'productos tienen la Bodega agotada o con reserva baja'}
                    </p>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5">
                    Ingresa cajas de respaldo a Bodega o registra una compra a proveedor para mantener tu stock seguro.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === 'low_bodega' ? 'all' : 'low_bodega')}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
                >
                  {activeCategory === 'low_bodega' ? 'Ver Todo' : 'Filtrar Bodega'}
                </button>

                {firstLowBodega && (
                  <button
                    type="button"
                    onClick={() => openQuickAdjustModal(firstLowBodega, 12)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-xs font-black shadow-lg shadow-amber-950/50 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Boxes className="w-4 h-4" />
                    <span>Surtir Bodega ({firstLowBodega.name.split(' ')[0]})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 1: CATÁLOGO DE PRODUCTOS */}
      {/* ========================================================================= */}
      {activeTab === 'catalogo' && (
        <div className="space-y-4 animate-fadeIn">
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
                  type="button"
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

          {/* Grid de Productos o Estado en Cero */}
          {products.length === 0 ? (
            <div className="rock-card p-10 sm:p-14 text-center rounded-3xl border border-zinc-800 space-y-5 max-w-xl mx-auto my-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center text-3xl">
                📦
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Catálogo de Productos en Cero (0)</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Tu bar está limpio y listo para empezar. Puedes ingresar tus productos manualmente o cargar la plantilla sugerida con 18 bebidas estándar de Colombia.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormName('')
                    setFormCategory('Cervezas')
                    setFormPrice(10000)
                    setFormCost(5000)
                    setFormStockNevera(10)
                    setFormStockBodega(10)
                    setFormMinStockNevera(5)
                    setFormMinStock(5)
                    setFormBarcode('')
                    setShowProductModal(true)
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/40 cursor-pointer"
                >
                  + Crear Primer Producto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loadSuggestedProductsTemplate()
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cargar Plantilla Sugerida</span>
                </button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rock-card p-10 text-center text-zinc-500 rounded-2xl">
              No se encontraron productos con el filtro aplicado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock <= p.min_stock
              const stockNev = p.stock_nevera ?? p.stock ?? 0
              const stockBod = p.stock_bodega ?? 0
              const minNev = p.min_stock_nevera ?? Math.max(2, Math.floor((p.min_stock || 10) / 2))
              const minBod = Math.max(1, (p.min_stock || 10) - minNev)
              const isLowNevera = stockNev <= minNev
              const isLowBodega = stockBod <= 0 || stockBod <= minBod || isLowStock
              const margin = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0

              return (
                <div
                  key={p.id}
                  className={`rock-card p-5 rounded-2xl transition-all relative overflow-hidden group hover:border-red-600/70 ${
                    isLowNevera
                      ? 'border-amber-500/60 shadow-lg shadow-amber-950/20'
                      : isLowBodega
                      ? 'border-orange-500/50 shadow-lg shadow-orange-950/20'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/60">
                        {p.category}
                      </span>
                      {p.active === false && (
                        <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Pausado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 ${
                          p.stock <= 0
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isLowNevera && isLowBodega
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                            : isLowNevera
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : isLowBodega
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {p.stock <= 0 ? (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1 inline" />
                            <span>Agotado</span>
                          </>
                        ) : isLowNevera && isLowBodega ? (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1 inline text-red-400" />
                            <span>Crítico Total</span>
                          </>
                        ) : isLowNevera ? (
                          <>
                            <Snowflake className="w-3 h-3 mr-1 inline text-cyan-400" />
                            <span>Nevera Baja</span>
                          </>
                        ) : isLowBodega ? (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1 inline text-amber-400" />
                            <span>{stockBod <= 0 ? 'Bodega Vacía' : 'Bodega Baja'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1 inline" />
                            <span>Óptimo</span>
                          </>
                        )}
                      </span>

                      {/* Botón Editar Producto */}
                      <button
                        type="button"
                        onClick={() => openEditProduct(p)}
                        title="Editar precios, costos, stock de nevera/bodega o datos del producto"
                        className="p-1 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Botón Pausar/Activar */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        title={p.active === false ? 'Habilitar para venta en POS' : 'Pausar temporalmente (no vender hoy)'}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          p.active === false
                            ? 'text-zinc-600 hover:text-emerald-400 hover:bg-zinc-800'
                            : 'text-emerald-500 hover:text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      {/* Botón Eliminar con animación de bote comiéndose la etiqueta */}
                      <GulpDeleteButton
                        size="xs"
                        label="Borrar"
                        title="Eliminar este producto del catálogo"
                        onDelete={() => handleDeleteProduct(p)}
                      />
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-400 transition-colors mb-1">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono mb-3">SKU: {p.barcode || 'N/A'}</p>

                  {/* Precios y Costos */}
                  <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 mb-3 grid grid-cols-2 gap-2">
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

                  {/* Tarjeta de Inventario Dual: Nevera + Bodega */}
                  <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-semibold">Total en Sistema:</span>
                      <strong className="text-sm font-black text-white">{p.stock} uds</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900">
                      {/* Nevera */}
                      <div
                        className={`p-2 rounded-lg border flex flex-col justify-between ${
                          isLowNevera
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="flex items-center space-x-1">
                            <span>❄️</span>
                            <span>Nevera</span>
                          </span>
                          {isLowNevera && (
                            <span className="bg-amber-500/20 text-amber-400 px-1 rounded text-[9px] font-black animate-pulse">
                              {stockNev <= 0 ? '¡Vacía!' : '¡Baja!'}
                            </span>
                          )}
                        </div>
                        <p className="text-base font-black mt-1">
                          {stockNev} <span className="text-[10px] font-normal text-zinc-400">frías</span>
                        </p>
                        <span className="text-[9px] text-zinc-500">mínimo: {minNev}</span>
                      </div>

                      {/* Bodega */}
                      <div
                        className={`p-2 rounded-lg border flex flex-col justify-between ${
                          isLowBodega
                            ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="flex items-center space-x-1">
                            <span>📦</span>
                            <span>Bodega</span>
                          </span>
                          {isLowBodega && (
                            <span className="bg-orange-500/20 text-orange-400 px-1 rounded text-[9px] font-black animate-pulse">
                              {stockBod <= 0 ? '¡Vacía!' : '¡Baja!'}
                            </span>
                          )}
                        </div>
                        <p className="text-base font-black mt-1">
                          {stockBod} <span className="text-[10px] font-normal text-zinc-400">reserva</span>
                        </p>
                        <span className="text-[9px] text-zinc-500">mínimo: {minBod}</span>
                      </div>
                    </div>

                    {/* Botones rápidos de transferencia o surtido */}
                    {stockBod > 0 ? (
                      <button
                        type="button"
                        onClick={() => openTransferModal(p)}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                          isLowNevera
                            ? 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white shadow-md shadow-amber-900/30'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60'
                        }`}
                      >
                        <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
                        <span>{isLowNevera ? '¡Pasar de Bodega a Nevera!' : 'Pasar a Nevera'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openQuickAdjustModal(p, 12)}
                        className="w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition-all cursor-pointer"
                      >
                        <Boxes className="w-3.5 h-3.5 text-amber-400" />
                        <span>⚠️ Bodega en 0 • Surtir Bodega / Nevera</span>
                      </button>
                    )}
                  </div>

                  {/* Ajustador de Stock Manual con selección de destino (Nevera o Bodega) */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400">Ajuste rápido (Nevera/Bodega):</span>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => openQuickAdjustModal(p, -1)}
                        title="Restar unidades de Nevera o Bodega"
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openQuickAdjustModal(p, 1)}
                        title="Sumar unidades a Nevera o Bodega"
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openQuickAdjustModal(p, 10)}
                        title="Sumar paquete (+10 uds) a Nevera o Bodega"
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] font-bold text-amber-300 cursor-pointer"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: COMPRAS & REABASTECIMIENTO */}
      {/* ========================================================================= */}
      {activeTab === 'compras' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Historial de Órdenes de Compra ({purchases.length})</span>
            </h3>
            <span className="text-xs text-zinc-400">Entradas de stock a bodega</span>
          </div>

          {purchases.length === 0 ? (
            <div className="rock-card p-10 text-center text-zinc-500 rounded-2xl">
              No hay compras registradas aún. Haz clic en &quot;+ Registrar Compra&quot; para ingresar inventario.
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((pc: PurchaseRecord) => (
                <div key={pc.id} className="rock-card p-5 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-zinc-800">
                    <div className="flex items-center space-x-3">
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        {pc.id}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{pc.supplierName}</h4>
                        <p className="text-[11px] text-zinc-400">
                          {pc.date} • Por {pc.user}
                          {pc.invoiceNumber && <span className="ml-2 font-mono text-zinc-500">Factura: {pc.invoiceNumber}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold">Total Compra</p>
                      <p className="text-base font-black text-amber-400 font-mono">{formatCOP(pc.totalAmount)}</p>
                      <span className="text-[10px] text-zinc-400 font-medium">Pago: {pc.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Detalle de Artículos Comprados */}
                  <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 divide-y divide-zinc-900 text-xs">
                    {pc.items.map((it, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span className="text-zinc-200">
                          <strong className="text-emerald-400 font-mono">+{it.quantity} uds</strong> • {it.productName}
                        </span>
                        <div className="text-right">
                          <span className="text-zinc-400 font-mono text-[11px]">{formatCOP(it.unitCost)} c/u</span>
                          <span className="text-white font-mono font-bold ml-3">{formatCOP(it.subtotal)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pc.notes && (
                    <p className="text-[11px] text-zinc-500 italic bg-zinc-950/50 p-2 rounded-lg">
                      Nota: {pc.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: DIRECTORIO DE PROVEEDORES */}
      {/* ========================================================================= */}
      {activeTab === 'proveedores' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Directorio Oficial de Proveedores ({suppliers.length})</span>
            </h3>
            <span className="text-xs text-zinc-400">Canales de abastecimiento del bar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup: SupplierState) => (
              <div key={sup.id} className="rock-card p-5 rounded-2xl border border-zinc-800 space-y-3 relative group">
                <div className="flex items-start justify-between pb-2 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">
                      {sup.category}
                    </span>
                    <h4 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                      {sup.name}
                    </h4>
                  </div>
                  <GulpDeleteButton
                    size="xs"
                    label="Borrar"
                    title="Eliminar proveedor"
                    onDelete={() => handleDeleteSupplier(sup)}
                  />
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>Contacto: <strong>{sup.contactName}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono text-emerald-300">{sup.phone}</span>
                  </div>

                  {sup.email && (
                    <div className="flex items-center space-x-2">
                      <span className="text-zinc-500">✉️</span>
                      <span className="text-zinc-400 truncate">{sup.email}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-1 border-t border-zinc-900 text-[11px] text-zinc-400">
                    <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Entrega: {sup.leadTime}</span>
                  </div>

                  <div className="text-[11px] text-zinc-400">
                    <span>Condiciones: <strong>{sup.paymentTerms}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setPurchaseSupplierId(sup.id)
                      setActiveTab('compras')
                      setShowPurchaseModal(true)
                    }}
                    className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-zinc-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hacer Pedido a este Proveedor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 4: KARDEX / MOVIMIENTOS DE INVENTARIO */}
      {/* ========================================================================= */}
      {activeTab === 'kardex' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Auditoría de Kardex & Movimientos ({inventoryMovements.length})</span>
            </h3>
            <span className="text-xs text-zinc-400">Trazabilidad física de botellas y productos</span>
          </div>

          <div className="rock-card rounded-2xl overflow-hidden divide-y divide-zinc-800/80">
            {inventoryMovements.length === 0 ? (
              <p className="p-8 text-center text-xs text-zinc-500">No hay movimientos de inventario registrados.</p>
            ) : (
              inventoryMovements.map((mov: InventoryMovementRecord) => {
                const isIncoming = mov.quantity > 0
                const isLoss = mov.type === 'loss'
                const isSale = mov.type === 'sale'

                return (
                  <div key={mov.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isIncoming
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isLoss
                            ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                            : isSale
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isIncoming ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-white text-xs sm:text-sm">{mov.productName}</p>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              mov.type === 'purchase'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : mov.type === 'sale'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : mov.type === 'loss'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {mov.type === 'purchase'
                              ? 'Compra'
                              : mov.type === 'sale'
                              ? 'Venta Mesa'
                              : mov.type === 'loss'
                              ? 'Merma / Rotura'
                              : 'Ajuste Físico'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{mov.reason}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {mov.time} • Por {mov.user} • Stock resultante: <strong className="text-zinc-300 font-mono">{mov.resultingStock} uds</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-black font-mono ${
                          isIncoming ? 'text-emerald-400' : isLoss ? 'text-red-500' : 'text-blue-400'
                        }`}
                      >
                        {isIncoming ? '+' : ''}
                        {mov.quantity} uds
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVO PRODUCTO */}
      {/* ========================================================================= */}
      {showProductModal && (
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
                type="button"
                onClick={() => setShowProductModal(false)}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-300">Categoría *</label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      + Crear categoría
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {barCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                      </option>
                    ))}
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

              {/* Distribución Dual: Nevera y Bodega */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>❄️📦</span>
                    <span>Distribución de Inventario</span>
                  </span>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Total: {formStockNevera + formStockBodega} unidades
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      ❄️ Stock en Nevera (Frías / Barra) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formStockNevera}
                      onChange={(e) => setFormStockNevera(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-bold"
                    />
                    <span className="text-[10px] text-zinc-500">Listas para servir</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      📦 Stock en Bodega (Almacén / Cajas) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formStockBodega}
                      onChange={(e) => setFormStockBodega(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-bold"
                    />
                    <span className="text-[10px] text-zinc-500">Cajas de reserva</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      ⚠️ Mínimo en Nevera (Alerta)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formMinStockNevera}
                      onChange={(e) => setFormMinStockNevera(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                    <span className="text-[9px] text-zinc-500">Avisa para enfriar</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      🚨 Mínimo Total (Alerta Compra)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formMinStock}
                      onChange={(e) => setFormMinStock(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                    <span className="text-[9px] text-zinc-500">Avisa para pedir proveedor</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
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

      {/* ========================================================================= */}
      {/* MODAL: EDITAR PRODUCTO */}
      {/* ========================================================================= */}
      {showEditProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-lg p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-500 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Editar Producto</h3>
                  <p className="text-xs text-zinc-400">Modifica precios, costos, categoría o stock físico</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProductModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ej. Cerveza Corona Extra 355ml"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-300">Categoría *</label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      + Crear categoría
                    </button>
                  </div>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {barCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Código / SKU</label>
                  <input
                    type="text"
                    value={editBarcode}
                    onChange={(e) => setEditBarcode(e.target.value)}
                    placeholder="Ej. 7701230001"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
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
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Costo Compra (COP) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Distribución Dual: Nevera y Bodega */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>❄️📦</span>
                    <span>Distribución de Inventario</span>
                  </span>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Total: {editStockNevera + editStockBodega} unidades
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      ❄️ Stock en Nevera (Frías / Barra) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editStockNevera}
                      onChange={(e) => setEditStockNevera(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
                    />
                    <span className="text-[10px] text-zinc-500">Listas para servir</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      📦 Stock en Bodega (Almacén / Cajas) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editStockBodega}
                      onChange={(e) => setEditStockBodega(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
                    />
                    <span className="text-[10px] text-zinc-500">Cajas de reserva</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      ⚠️ Mínimo en Nevera (Alerta)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editMinStockNevera}
                      onChange={(e) => setEditMinStockNevera(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[9px] text-zinc-500">Avisa para enfriar</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      🚨 Mínimo Total (Alerta Compra)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editMinStock}
                      onChange={(e) => setEditMinStock(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[9px] text-zinc-500">Avisa para pedir proveedor</span>
                  </div>
                </div>
              </div>

              {/* Estado de Venta Activo / Pausado */}
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Disponibilidad en el POS</p>
                  <p className="text-[11px] text-zinc-400">Si está inactivo, no se podrá agregar a las comandas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    editActive
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {editActive ? 'Activo (En Venta)' : 'Pausado (Oculto)'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800">
                {editingProductId ? (
                  <GulpDeleteButton
                    size="sm"
                    variant="danger"
                    label="Eliminar Producto"
                    onDelete={() => {
                      const target = products.find((pr) => pr.id === editingProductId)
                      setShowEditProductModal(false)
                      if (target) {
                        handleDeleteProduct(target)
                      }
                    }}
                  />
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditProductModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRANSFERIR DE BODEGA A NEVERA (REABASTECER) */}
      {/* ========================================================================= */}
      {showTransferModal && transferProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                  <Snowflake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Reabastecer Nevera</h3>
                  <p className="text-xs text-zinc-400">Pasar cervezas de bodega a frío para servir</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 space-y-2">
              <p className="text-sm font-bold text-white">{transferProduct.name}</p>
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">❄️ En Nevera</span>
                  <span className="text-base font-black text-amber-400">
                    {transferProduct.stock_nevera ?? transferProduct.stock} uds
                  </span>
                  <span className="text-[9px] text-zinc-500 block">mín: {transferProduct.min_stock_nevera ?? 6}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">📦 En Bodega</span>
                  <span className="text-base font-black text-cyan-400">
                    {transferProduct.stock_bodega ?? 0} uds
                  </span>
                  <span className="text-[9px] text-zinc-500 block">disponibles</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                ¿Cuántas unidades vas a transferir a la nevera?
              </label>
              <input
                type="number"
                min={1}
                max={transferProduct.stock_bodega ?? 0}
                value={transferQty}
                onChange={(e) => setTransferQty(Math.max(1, Math.min(transferProduct.stock_bodega ?? 0, Number(e.target.value))))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xl font-black text-center text-white focus:outline-none focus:border-cyan-500 font-mono"
              />

              {/* Botones de atajo rápido */}
              <div className="flex items-center justify-center space-x-2 pt-1 flex-wrap gap-y-1">
                {[6, 12, 24].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    disabled={(transferProduct.stock_bodega ?? 0) < qty}
                    onClick={() => setTransferQty(qty)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
                  >
                    +{qty} uds
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTransferQty(transferProduct.stock_bodega ?? 0)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-bold transition-colors cursor-pointer"
                >
                  Todas ({transferProduct.stock_bodega ?? 0})
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={transferQty <= 0 || (transferProduct.stock_bodega ?? 0) <= 0}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/30 transition-all cursor-pointer disabled:opacity-50"
              >
                Confirmar y Enfriar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJUSTE RÁPIDO CON SELECCIÓN DE DESTINO (NEVERA VS BODEGA)          */}
      {/* ========================================================================= */}
      {showQuickAdjustModal && quickAdjustProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowQuickAdjustModal(false)}
        >
          <div
            className="rock-card w-full max-w-md p-6 rounded-3xl border border-zinc-700/80 shadow-2xl relative space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`p-2.5 rounded-xl border ${
                    quickAdjustSign === 1
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border-red-500/30'
                  }`}
                >
                  {quickAdjustSign === 1 ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    {quickAdjustSign === 1 ? 'Ingreso Rápido de Unidades' : 'Descuento Rápido de Unidades'}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium truncate max-w-[260px]">
                    {quickAdjustProduct.name} • Elige hacia dónde va el ajuste
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAdjustModal(false)}
                className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector Sumar (+) vs Restar (-) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <button
                type="button"
                onClick={() => setQuickAdjustSign(1)}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  quickAdjustSign === 1
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sumar Stock (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickAdjustSign(-1)}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  quickAdjustSign === -1
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Restar Stock (-)</span>
              </button>
            </div>

            {/* Cantidad a Ajustar */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Cantidad de Unidades
                </label>
                <span className="text-[11px] text-zinc-500 font-medium">
                  Total actual: <strong className="text-white">{quickAdjustProduct.stock} uds</strong>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuickAdjustQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-black text-lg cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quickAdjustQty}
                  onChange={(e) => setQuickAdjustQty(Math.max(1, Number(e.target.value)))}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-center text-xl font-black text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setQuickAdjustQty((q) => q + 1)}
                  className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-black text-lg cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Atajos rápidos de cantidad */}
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {[1, 6, 10, 12, 24, 30].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuickAdjustQty(val)}
                    className={`py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                      quickAdjustQty === val
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {quickAdjustSign === 1 ? `+${val}` : `-${val}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de Destino: ¿Hacia dónde va? (Nevera vs Bodega) */}
            <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
              <p className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <span>¿En dónde deseas {quickAdjustSign === 1 ? 'guardar' : 'descontar'} estas {quickAdjustQty} uds?</span>
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Destino 1: NEVERA */}
                <button
                  type="button"
                  onClick={() => handleConfirmQuickAdjust('nevera')}
                  disabled={quickAdjustSign === -1 && (quickAdjustProduct.stock_nevera ?? 0) <= 0}
                  className="group p-4 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/60 via-zinc-900 to-zinc-950 hover:from-cyan-900/60 hover:border-cyan-400 transition-all text-left flex flex-col justify-between space-y-3 shadow-lg shadow-cyan-950/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center space-x-1">
                      <span>❄️ En Nevera</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {quickAdjustSign === 1 ? `+${quickAdjustQty}` : `-${quickAdjustQty}`}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] text-zinc-400">Stock frío actual: <strong className="text-white">{quickAdjustProduct.stock_nevera ?? 0}</strong></p>
                    <p className="text-sm font-black text-cyan-300 mt-0.5">
                      Quedará en:{' '}
                      {Math.max(0, (quickAdjustProduct.stock_nevera ?? 0) + quickAdjustQty * quickAdjustSign)} frías
                    </p>
                  </div>

                  <div className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black text-xs text-center transition-colors shadow-md shadow-cyan-950/50">
                    {quickAdjustSign === 1 ? '❄️ Guardar en Nevera' : '❄️ Restar de Nevera'}
                  </div>
                </button>

                {/* Destino 2: BODEGA */}
                <button
                  type="button"
                  onClick={() => handleConfirmQuickAdjust('bodega')}
                  disabled={quickAdjustSign === -1 && (quickAdjustProduct.stock_bodega ?? 0) <= 0}
                  className="group p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/60 via-zinc-900 to-zinc-950 hover:from-amber-900/60 hover:border-amber-400 transition-all text-left flex flex-col justify-between space-y-3 shadow-lg shadow-amber-950/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center space-x-1">
                      <span>📦 En Bodega</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {quickAdjustSign === 1 ? `+${quickAdjustQty}` : `-${quickAdjustQty}`}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] text-zinc-400">Reserva actual: <strong className="text-white">{quickAdjustProduct.stock_bodega ?? 0}</strong></p>
                    <p className="text-sm font-black text-amber-300 mt-0.5">
                      Quedará en:{' '}
                      {Math.max(0, (quickAdjustProduct.stock_bodega ?? 0) + quickAdjustQty * quickAdjustSign)} reserva
                    </p>
                  </div>

                  <div className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs text-center transition-colors shadow-md shadow-amber-950/50">
                    {quickAdjustSign === 1 ? '📦 Guardar en Bodega' : '📦 Restar de Bodega'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVA ORDEN DE COMPRA */}
      {/* ========================================================================= */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-xl p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Registrar Compra a Proveedor</h3>
                  <p className="text-xs text-zinc-400">Suma existencias al inventario automáticamente</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPurchase} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Proveedor *</label>
                  <select
                    value={purchaseSupplierId}
                    onChange={(e) => setPurchaseSupplierId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Nº Factura / Remisión</label>
                  <input
                    type="text"
                    value={purchaseInvoice}
                    onChange={(e) => setPurchaseInvoice(e.target.value)}
                    placeholder="Ej. FACT-98210"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Lista de Productos Comprados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Productos Recibidos *</label>
                  <button
                    type="button"
                    onClick={() =>
                      setPurchaseItems([
                        ...purchaseItems,
                        { productId: products[0]?.id || '', quantity: 12, unitCost: products[0]?.cost || 5000 },
                      ])
                    }
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Otro Ítem</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const newProdId = e.target.value
                            const target = products.find((p) => p.id === newProdId)
                            const updated = [...purchaseItems]
                            updated[idx].productId = newProdId
                            if (target) updated[idx].unitCost = target.cost
                            setPurchaseItems(updated)
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...purchaseItems]
                            updated[idx].quantity = Number(e.target.value)
                            setPurchaseItems(updated)
                          }}
                          placeholder="Cantidad"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono font-bold"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={item.unitCost}
                          onChange={(e) => {
                            const updated = [...purchaseItems]
                            updated[idx].unitCost = Number(e.target.value)
                            setPurchaseItems(updated)
                          }}
                          placeholder="Costo u."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        {purchaseItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPurchaseItems(purchaseItems.filter((_, i) => i !== idx))}
                            className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Método de pago y Total */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Método de Pago</label>
                  <select
                    value={purchasePaymentMethod}
                    onChange={(e) =>
                      setPurchasePaymentMethod(e.target.value as 'Efectivo Caja' | 'Transferencia' | 'Crédito')
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Transferencia">Transferencia Bancaria (Bancolombia/Nequi)</option>
                    <option value="Efectivo Caja">Efectivo de Caja (Descontar de Turno)</option>
                    <option value="Crédito">Crédito a Proveedor (Por pagar)</option>
                  </select>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total a Pagar</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {formatCOP(
                      purchaseItems.reduce((acc, it) => acc + (it.quantity || 0) * (it.unitCost || 0), 0)
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Notas u Observaciones</label>
                <input
                  type="text"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  placeholder="Ej. Entrega recibida completa en bodega principal..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  Confirmar e Ingresar a Bodega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVO PROVEEDOR */}
      {/* ========================================================================= */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-lg p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Registrar Nuevo Proveedor</h3>
                  <p className="text-xs text-zinc-400">Agrega contactos comerciales de abastecimiento</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nombre o Empresa Proveedora *</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="Ej. Bavaria S.A., Distribuidora de Licores La 70..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Categoría Principal</label>
                  <select
                    value={supCategory}
                    onChange={(e) => setSupCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Cervezas & Maltas">Cervezas & Maltas</option>
                    <option value="Licores & Aguardientes">Licores & Aguardientes</option>
                    <option value="Licores Importados & Whisky">Licores Importados & Whisky</option>
                    <option value="Gaseosas & Bebidas">Gaseosas & Bebidas</option>
                    <option value="Snacks & Alimentos">Snacks & Alimentos</option>
                    <option value="Insumos de Barra & Coctelería">Insumos de Barra & Coctelería</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Nombre del Asesor / Contacto</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="Ej. Juan Pérez (Vendedor)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="Ej. +57 312 345 6789"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="pedidos@proveedor.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Tiempo de Entrega</label>
                  <input
                    type="text"
                    value={supLeadTime}
                    onChange={(e) => setSupLeadTime(e.target.value)}
                    placeholder="Ej. 24 horas, Mismo día"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Términos de Pago</label>
                  <input
                    type="text"
                    value={supTerms}
                    onChange={(e) => setSupTerms(e.target.value)}
                    placeholder="Ej. Contado, Crédito 15 días"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJUSTE / MERMA DE INVENTARIO */}
      {/* ========================================================================= */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Ajuste de Bodega / Merma</h3>
                  <p className="text-xs text-zinc-400">Registrar roturas, vencimiento o auditoría</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdjustmentModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Producto a Ajustar *</label>
                <select
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock actual: {p.stock} uds)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjType('loss')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    adjType === 'loss'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Merma / Rotura (-)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType('adjustment')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    adjType === 'adjustment'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-900/30'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Ajuste Auditoría (+)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Cantidad ({adjType === 'loss' ? 'Unidades a dar de baja' : 'Unidades a ingresar'}) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjQuantity}
                  onChange={(e) => setAdjQuantity(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Motivo o Razón *</label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="Ej. Botella rota en transporte, vencimiento, conteo físico..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
                >
                  Aplicar Ajuste a Bodega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GESTIONAR Y CREAR CATEGORÍAS DE PRODUCTOS DEL NEGOCIO */}
      {/* ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-amber-500/40 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Categorías de Productos</h3>
                  <p className="text-xs text-zinc-400">Personaliza las categorías según el menú de tu negocio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3">
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Icono</label>
                  <select
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-2.5 text-base text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {['🍺', '🥃', '🍸', '🍷', '🍔', '🍕', '🌮', '🥤', '☕', '💨', '🎱', '🍾', '🍰', '🔥'].map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-9">
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Nombre de la Nueva Categoría *</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ej. Vinos, Shots, Botellas VIP, Comida Rápida..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs whitespace-nowrap cursor-pointer"
                    >
                      + Crear
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Categorías Activas ({barCategories.length})
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {barCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{cat.icon || '📦'}</span>
                      <span className="font-bold text-white">{cat.name}</span>
                      {cat.isDefault && (
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                          Base
                        </span>
                      )}
                    </div>
                    {!cat.isDefault && (
                      <GulpDeleteButton
                        size="xs"
                        label="Borrar"
                        title="Eliminar categoría personalizada"
                        onBeforeEat={() => confirmDeleteCategory(cat.name)}
                        onDelete={() => handleDeleteCategory(cat.id, cat.name)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
