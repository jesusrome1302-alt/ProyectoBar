import { useSyncExternalStore } from 'react'
import { saveCloudBarData, getCloudBarData } from '@/lib/supabaseClient'

export interface OrderItemState {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
  notes?: string
}

export interface PaymentRecord {
  id: string
  method: string
  amount: number
  timestamp: string
  operator: string
}

export interface TableState {
  id: number
  name: string
  customerName?: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  openedAt?: string
  operator: string
  items: OrderItemState[]
  payments: PaymentRecord[]
  total: number
  paid: number
  pending: number
  notes?: string
}

export interface CashSessionRecord {
  id: string
  openedAt: string
  closedAt?: string
  operator: string
  initialCash: number
  cashSales: number
  electronicSales: number
  expenses: number
  expectedCash: number
  actualCash?: number
  difference?: number
  notes?: string
  status: 'open' | 'closed'
}

export interface CashState {
  initialCash: number
  cashSales: number
  electronicSales: number
  expenses: number
  expectedCash: number
  status: 'open' | 'closed'
  openedAt: string
  currentSessionId?: string
}

export interface CashMovementRecord {
  id: string
  type: 'in' | 'out' | 'sale'
  category?: string
  description: string
  amount: number
  time: string
  user: string
}

export interface SupplierState {
  id: string
  name: string
  category: string
  contactName: string
  phone: string
  email?: string
  leadTime: string
  paymentTerms: string
  address?: string
}

export interface PurchaseItem {
  productId: string
  productName: string
  quantity: number
  unitCost: number
  subtotal: number
}

export interface PurchaseRecord {
  id: string
  supplierId: string
  supplierName: string
  invoiceNumber?: string
  items: PurchaseItem[]
  totalAmount: number
  paymentMethod: 'Efectivo Caja' | 'Transferencia' | 'Crédito'
  date: string
  user: string
  notes?: string
}

export interface InventoryMovementRecord {
  id: string
  productId: string
  productName: string
  type: 'purchase' | 'sale' | 'loss' | 'adjustment'
  quantity: number
  reason: string
  time: string
  user: string
  resultingStock: number
}

export interface SaleReceiptRecord {
  id: string
  tableId: number
  tableName: string
  customerName?: string
  closedAt: string
  operator: string
  items: OrderItemState[]
  payments: PaymentRecord[]
  subtotal: number
  tip: number
  total: number
}

export interface BarSettings {
  barName: string
  nit: string
  address: string
  phone: string
  footerText: string
  tipPercentage: number
  taxPercentage: number
}

export interface ProductState {
  id: string
  name: string
  category: string
  price: number
  cost: number
  stock: number
  min_stock: number
  barcode?: string
  active?: boolean
  description?: string
}

export interface BarData {
  operatorName: string
  activeTableId?: number
  tables: TableState[]
  cash: CashState
  movements: CashMovementRecord[]
  products: ProductState[]
  sessions: CashSessionRecord[]
  suppliers: SupplierState[]
  purchases: PurchaseRecord[]
  inventoryMovements: InventoryMovementRecord[]
  closedSales?: SaleReceiptRecord[]
  settings?: BarSettings
}

export const DEFAULT_SETTINGS: BarSettings = {
  barName: 'ROCK BAR',
  nit: '900.123.456-7',
  address: 'Calle 10 # 40-20, Medellín',
  phone: '+57 (4) 444-1234',
  footerText: '¡Gracias por tu visita a Rock Bar! El rock nunca muere.',
  tipPercentage: 10,
  taxPercentage: 8,
}

const STORAGE_KEY = 'ROCK_BAR_APP_STATE_V1'

export const INITIAL_PRODUCTS: ProductState[] = [
  // Cervezas
  { id: 'prod-1', name: 'Corona Extra 355ml', category: 'Cervezas', price: 14000, cost: 7500, stock: 36, min_stock: 12, barcode: '7701234001' },
  { id: 'prod-2', name: 'Club Colombia Dorada 330ml', category: 'Cervezas', price: 10000, cost: 5200, stock: 48, min_stock: 15, barcode: '7701234002' },
  { id: 'prod-3', name: 'Heineken Long Neck', category: 'Cervezas', price: 15000, cost: 8000, stock: 24, min_stock: 10, barcode: '7701234003' },
  { id: 'prod-4', name: 'BBC Cajicá Miel', category: 'Cervezas', price: 16000, cost: 8800, stock: 12, min_stock: 10, barcode: '7701234004' },
  { id: 'prod-5', name: 'Poker Lata 330ml', category: 'Cervezas', price: 8000, cost: 4000, stock: 50, min_stock: 15, barcode: '7701234005' },
  { id: 'prod-6', name: 'Águila Original 330ml', category: 'Cervezas', price: 8000, cost: 4100, stock: 60, min_stock: 20, barcode: '7701234006' },

  // Licores
  { id: 'prod-7', name: 'Trago Whisky Johnnie Walker Black', category: 'Licores', price: 28000, cost: 16000, stock: 25, min_stock: 5, barcode: '7701234007' },
  { id: 'prod-8', name: 'Trago Ron Medellín 8 Años', category: 'Licores', price: 18000, cost: 9500, stock: 30, min_stock: 6, barcode: '7701234008' },
  { id: 'prod-9', name: 'Trago Aguardiente Antioqueño Azul', category: 'Licores', price: 12000, cost: 6500, stock: 40, min_stock: 10, barcode: '7701234009' },
  { id: 'prod-10', name: 'Trago Tequila José Cuervo', category: 'Licores', price: 24000, cost: 13000, stock: 20, min_stock: 4, barcode: '7701234010' },

  // Cócteles
  { id: 'prod-11', name: 'Cóctel Rock Margarita', category: 'Cócteles', price: 32000, cost: 11000, stock: 50, min_stock: 10, barcode: '7701234011' },
  { id: 'prod-12', name: 'Mojito Cubano Clásico', category: 'Cócteles', price: 28000, cost: 9500, stock: 50, min_stock: 10, barcode: '7701234012' },
  { id: 'prod-13', name: 'Gin Tonic Botanicals', category: 'Cócteles', price: 35000, cost: 13000, stock: 40, min_stock: 10, barcode: '7701234013' },

  // Snacks
  { id: 'prod-14', name: 'Nachos Cheddar & Jalapeños', category: 'Snacks', price: 26000, cost: 11500, stock: 18, min_stock: 5, barcode: '7701234014' },
  { id: 'prod-15', name: 'Alitas BBQ Rocker x8', category: 'Snacks', price: 34000, cost: 16000, stock: 15, min_stock: 6, barcode: '7701234015' },
  { id: 'prod-16', name: 'Papas Rústicas con Tocineta', category: 'Snacks', price: 22000, cost: 9000, stock: 22, min_stock: 8, barcode: '7701234016' },

  // Sin Alcohol
  { id: 'prod-17', name: 'Red Bull 250ml', category: 'Sin Alcohol', price: 15000, cost: 8500, stock: 20, min_stock: 8, barcode: '7701234017' },
  { id: 'prod-18', name: 'Agua Manantial con Gas', category: 'Sin Alcohol', price: 6000, cost: 2500, stock: 30, min_stock: 10, barcode: '7701234018' },
]

export const INITIAL_SUPPLIERS: SupplierState[] = [
  {
    id: 'sup-1',
    name: 'Bavaria S.A.',
    category: 'Cervezas & Maltas',
    contactName: 'Carlos Mendoza',
    phone: '+57 310 456 7890',
    email: 'pedidos@bavaria.com.co',
    leadTime: '24 a 48 horas',
    paymentTerms: 'Contado / Crédito 15 días',
    address: 'Zona Industrial Calle 80, Medellín',
  },
  {
    id: 'sup-2',
    name: 'Fábrica de Licores de Antioquia (FLA)',
    category: 'Licores & Aguardientes',
    contactName: 'Marcela Gómez',
    phone: '+57 300 987 6543',
    email: 'ventas@fla.com.co',
    leadTime: '48 horas',
    paymentTerms: 'Contado inmediato',
    address: 'Itagüí, Antioquia',
  },
  {
    id: 'sup-3',
    name: 'Diageo Colombia Distribuidores',
    category: 'Licores Importados & Whisky',
    contactName: 'Andrés Restrepo',
    phone: '+57 315 234 5678',
    email: 'contacto@diageocolombia.com',
    leadTime: '3 días hábiles',
    paymentTerms: 'Transferencia anticipada',
    address: 'El Poblado, Medellín',
  },
  {
    id: 'sup-4',
    name: 'Postobón & Bebidas No Alcohólicas',
    category: 'Gaseosas & Energizantes',
    contactName: 'Liliana Patiño',
    phone: '+57 312 678 1234',
    email: 'pedidos.bar@postobon.com',
    leadTime: '24 horas',
    paymentTerms: 'Efectivo o Transferencia',
    address: 'Carrera 48 # 32-102',
  },
  {
    id: 'sup-5',
    name: 'Snacks & Insumos Gourmet',
    category: 'Comidas & Snacks de Bar',
    contactName: 'Santiago Vélez',
    phone: '+57 318 890 4321',
    email: 'ventas@snacksrock.com',
    leadTime: 'Mismo día (urgencias)',
    paymentTerms: 'Contra entrega',
    address: 'Envigado, Barrio Obrero',
  },
]

export const DEFAULT_PURCHASES: PurchaseRecord[] = [
  {
    id: 'OC-101',
    supplierId: 'sup-1',
    supplierName: 'Bavaria S.A.',
    invoiceNumber: 'FACT-89210',
    date: 'Ayer, 10:00 AM',
    user: 'Cajero Principal',
    paymentMethod: 'Transferencia',
    items: [
      { productId: 'prod-1', productName: 'Corona Extra 355ml', quantity: 36, unitCost: 7500, subtotal: 270000 },
      { productId: 'prod-2', productName: 'Club Colombia Dorada 330ml', quantity: 48, unitCost: 5200, subtotal: 249600 },
    ],
    totalAmount: 519600,
    notes: 'Reabastecimiento regular de cervezas para fin de semana.',
  },
]

export const DEFAULT_INVENTORY_MOVEMENTS: InventoryMovementRecord[] = [
  {
    id: 'inv-1',
    productId: 'prod-1',
    productName: 'Corona Extra 355ml',
    type: 'purchase',
    quantity: 36,
    reason: 'Compra de inventario a Bavaria S.A. (FACT-89210)',
    time: 'Ayer, 10:00 AM',
    user: 'Cajero Principal',
    resultingStock: 36,
  },
  {
    id: 'inv-2',
    productId: 'prod-2',
    productName: 'Club Colombia Dorada 330ml',
    type: 'purchase',
    quantity: 48,
    reason: 'Compra de inventario a Bavaria S.A. (FACT-89210)',
    time: 'Ayer, 10:00 AM',
    user: 'Cajero Principal',
    resultingStock: 48,
  },
  {
    id: 'inv-3',
    productId: 'prod-5',
    productName: 'Poker Lata 330ml',
    type: 'loss',
    quantity: -2,
    reason: 'Merma por latas abolladas en bodega',
    time: 'Ayer, 04:30 PM',
    user: 'Cajero Principal',
    resultingStock: 50,
  },
  {
    id: 'inv-4',
    productId: 'prod-8',
    productName: 'Trago Ron Medellín 8 Años',
    type: 'sale',
    quantity: -4,
    reason: 'Consumo registrado Mesa 1',
    time: 'Hoy, 05:00 PM',
    user: 'Cajero Principal',
    resultingStock: 30,
  },
]

export const DEFAULT_BAR_DATA: BarData = {
  operatorName: 'Administrador',
  activeTableId: 1,
  tables: Array.from({ length: 8 }, (_, idx) => ({
    id: idx + 1,
    name: `Mesa ${idx + 1}`,
    capacity: 4,
    status: 'available',
    operator: 'Administrador',
    items: [],
    payments: [],
    total: 0,
    paid: 0,
    pending: 0,
  })),
  cash: {
    initialCash: 0,
    cashSales: 0,
    electronicSales: 0,
    expenses: 0,
    expectedCash: 0,
    status: 'closed',
    openedAt: '',
  },
  movements: [],
  products: [],
  sessions: [],
  suppliers: [],
  purchases: [],
  inventoryMovements: [],
  closedSales: [],
  settings: DEFAULT_SETTINGS,
}

let cachedData: BarData = DEFAULT_BAR_DATA
let cachedRaw: string | null = null
const listeners = new Set<() => void>()

export function loadBarData(): BarData {
  if (typeof window === 'undefined') return DEFAULT_BAR_DATA
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BAR_DATA))
      cachedRaw = JSON.stringify(DEFAULT_BAR_DATA)
      cachedData = DEFAULT_BAR_DATA
      return cachedData
    }
    if (raw === cachedRaw && cachedData) {
      return cachedData
    }
    cachedRaw = raw
    const parsed = JSON.parse(raw) as BarData

    if (!parsed.products) {
      parsed.products = []
    }
    if (!parsed.sessions) {
      parsed.sessions = []
    }
    if (!parsed.suppliers) {
      parsed.suppliers = []
    }
    if (!parsed.purchases) {
      parsed.purchases = []
    }
    if (!parsed.inventoryMovements) {
      parsed.inventoryMovements = []
    }
    if (!parsed.closedSales) {
      parsed.closedSales = []
    }
    if (!parsed.settings) {
      parsed.settings = DEFAULT_SETTINGS
    }

    // Si el establecimiento fue registrado por un usuario comercial y aún tiene órdenes o movimientos residuales del mock viejo, limpiar a 0
    if (parsed.settings?.barName && parsed.settings.barName !== 'ROCK BAR') {
      const hasOldMockOrders = parsed.tables?.some(t => t.items?.some(i => i.productId === 'prod-8' || i.productId === 'prod-15'))
      if (hasOldMockOrders) {
        parsed.tables = Array.from({ length: 8 }, (_, idx) => ({
          id: idx + 1,
          name: `Mesa ${idx + 1}`,
          capacity: 4,
          status: 'available',
          operator: parsed.operatorName || 'Personal',
          items: [],
          payments: [],
          total: 0,
          paid: 0,
          pending: 0,
        }))
        parsed.movements = []
        parsed.cash = {
          initialCash: 0,
          cashSales: 0,
          electronicSales: 0,
          expenses: 0,
          expectedCash: 0,
          status: 'closed',
          openedAt: '',
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      }
    }

    cachedData = parsed
    return cachedData
  } catch {
    return DEFAULT_BAR_DATA
  }
}

export function saveBarData(data: BarData): void {
  if (typeof window === 'undefined') return
  try {
    const str = JSON.stringify(data)
    cachedRaw = str
    // Clonación para garantizar nueva identidad de objeto y disparo inmediato en useSyncExternalStore
    cachedData = JSON.parse(str)
    localStorage.setItem(STORAGE_KEY, str)

    // Notificación sincrónica a componentes React
    listeners.forEach((listener) => {
      try {
        listener()
      } catch {
        // Ignorar listener fallido
      }
    })

    window.dispatchEvent(new Event('rock_bar_state_updated'))

    // Sincronización en segundo plano con la nube (Supabase) para soporte multi-dispositivo
    try {
      const authRaw = localStorage.getItem('ROCK_BAR_AUTH_SESSION_V1')
      if (authRaw) {
        const auth = JSON.parse(authRaw)
        const businessId = auth?.user?.businessId
        if (businessId) {
          saveCloudBarData(businessId, data).catch((e) =>
            console.warn('Error sincronizando bar_data en Supabase:', e)
          )
        }
      }
    } catch {
      // Ignorar error al leer auth
    }
  } catch {
    // Ignorar cuota de localStorage
  }
}

// Sincronizar datos del bar desde la nube (para cuando se ingresa desde otro portátil)
export async function syncCloudBarData(businessId?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    let targetBizId = businessId
    if (!targetBizId) {
      const authRaw = localStorage.getItem('ROCK_BAR_AUTH_SESSION_V1')
      if (authRaw) {
        const auth = JSON.parse(authRaw)
        targetBizId = auth?.user?.businessId
      }
    }
    if (!targetBizId) return false
    const cloudData = await getCloudBarData(targetBizId)
    if (cloudData && cloudData.tables && cloudData.tables.length > 0) {
      saveBarData(cloudData)
      return true
    }
  } catch (err) {
    console.warn('Error al sincronizar datos desde la nube:', err)
  }
  return false
}

export function addProductItem(item: Omit<ProductState, 'id'>): ProductState {
  const data = loadBarData()
  const newProduct: ProductState = {
    ...item,
    id: 'prod-' + Date.now(),
    active: item.active !== undefined ? item.active : true,
  }
  data.products = [newProduct, ...(data.products || INITIAL_PRODUCTS)]
  saveBarData(data)
  return newProduct
}

export function updateProductItem(id: string, updates: Partial<ProductState>): void {
  const data = loadBarData()
  data.products = (data.products || INITIAL_PRODUCTS).map((p) => {
    if (p.id === id) {
      return { ...p, ...updates }
    }
    return p
  })
  saveBarData(data)
}

export function toggleProductActive(id: string): void {
  const data = loadBarData()
  data.products = (data.products || INITIAL_PRODUCTS).map((p) => {
    if (p.id === id) {
      const nextActive = p.active === false ? true : false
      return { ...p, active: nextActive }
    }
    return p
  })
  saveBarData(data)
}

export function deleteProductItem(id: string): void {
  const data = loadBarData()
  data.products = (data.products || INITIAL_PRODUCTS).filter((p) => p.id !== id)
  saveBarData(data)
}

export function adjustProductStock(id: string, delta: number): void {
  const data = loadBarData()
  data.products = (data.products || INITIAL_PRODUCTS).map((p) => {
    if (p.id === id) {
      return { ...p, stock: Math.max(0, p.stock + delta) }
    }
    return p
  })
  saveBarData(data)
}

// Cierre de cuenta con archivado de recibo de venta
export function closeTableAndSaveReceipt(
  tableId: number,
  tip: number = 0
): SaleReceiptRecord | null {
  const data = loadBarData()
  const table = data.tables.find((t) => t.id === tableId)
  if (!table) return null

  const now = new Date()
  const timeStr = now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const subtotal = table.items.reduce((acc, it) => acc + it.subtotal, 0)
  const total = subtotal + tip

  const receipt: SaleReceiptRecord = {
    id: 'FAC-' + Date.now().toString().slice(-6),
    tableId: table.id,
    tableName: table.name,
    customerName: table.customerName,
    closedAt: timeStr,
    operator: data.operatorName || 'Cajero Principal',
    items: [...table.items],
    payments: [...(table.payments || [])],
    subtotal,
    tip,
    total,
  }

  data.closedSales = [receipt, ...(data.closedSales || [])]

  // Resetear la mesa
  data.tables = data.tables.map((t) => {
    if (t.id === tableId) {
      return {
        ...t,
        status: 'available' as const,
        items: [],
        payments: [],
        total: 0,
        paid: 0,
        pending: 0,
        openedAt: undefined,
        customerName: undefined,
        notes: undefined,
      }
    }
    return t
  })

  saveBarData(data)
  return receipt
}

// === FUNCIONES DINÁMICAS DE GESTIÓN DE MESAS Y CUENTAS DE CLIENTES ===

export function addTable(params: {
  name: string
  capacity?: number
  customerName?: string
  notes?: string
  autoOpen?: boolean
}): TableState {
  const data = loadBarData()
  const nextId = (data.tables.length > 0 ? Math.max(...data.tables.map((t) => t.id)) : 0) + 1
  const timeNow = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  const newTable: TableState = {
    id: nextId,
    name: params.name.trim() || `Mesa ${nextId}`,
    customerName: params.customerName?.trim() || undefined,
    capacity: params.capacity && params.capacity > 0 ? params.capacity : 4,
    status: params.autoOpen ? 'occupied' : 'available',
    openedAt: params.autoOpen ? timeNow : undefined,
    operator: data.operatorName || 'Cajero Principal',
    items: [],
    payments: [],
    total: 0,
    paid: 0,
    pending: 0,
    notes: params.notes?.trim() || undefined,
  }

  data.tables = [...data.tables, newTable]
  if (params.autoOpen || !data.activeTableId) {
    data.activeTableId = nextId
  }
  saveBarData(data)
  return newTable
}

export function updateTable(id: number, updates: Partial<TableState>): void {
  const data = loadBarData()
  data.tables = data.tables.map((t) => {
    if (t.id === id) {
      return { ...t, ...updates }
    }
    return t
  })
  saveBarData(data)
}

export function deleteTable(id: number): boolean {
  const data = loadBarData()
  const table = data.tables.find((t) => t.id === id)
  if (!table) return false

  data.tables = data.tables.filter((t) => t.id !== id)
  if (data.activeTableId === id) {
    data.activeTableId = data.tables[0]?.id || 1
  }
  saveBarData(data)
  return true
}

export function openTableWithCustomer(id: number, customerName?: string, notes?: string): void {
  const data = loadBarData()
  const timeNow = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  data.tables = data.tables.map((t) => {
    if (t.id === id) {
      return {
        ...t,
        status: 'occupied' as const,
        openedAt: timeNow,
        customerName: customerName?.trim() || t.customerName,
        notes: notes?.trim() || t.notes,
        items: t.items || [],
        payments: t.payments || [],
        total: t.total || 0,
        paid: t.paid || 0,
        pending: t.pending || 0,
      }
    }
    return t
  })
  data.activeTableId = id
  saveBarData(data)
}

// Actualizar configuración del establecimiento
export function updateBarSettings(newSettings: Partial<BarSettings>): void {
  const data = loadBarData()
  data.settings = { ...(data.settings || DEFAULT_SETTINGS), ...newSettings }
  saveBarData(data)
}

// Inicializar un nuevo bar registrado en el sistema 100% en CERO
export function registerNewBusinessBar(params: {
  barName: string
  ownerName: string
  phone?: string
  address?: string
  city?: string
  businessId?: string
}): void {
  const cleanName = params.barName.trim().toUpperCase()

  // 8 mesas disponibles y limpias en $0
  const cleanTables: TableState[] = Array.from({ length: 8 }, (_, idx) => ({
    id: idx + 1,
    name: `Mesa ${idx + 1}`,
    capacity: 4,
    status: 'available' as const,
    operator: params.ownerName,
    items: [],
    payments: [],
    total: 0,
    paid: 0,
    pending: 0,
  }))

  const cleanData: BarData = {
    operatorName: params.ownerName,
    activeTableId: 1,
    tables: cleanTables,
    cash: {
      initialCash: 0,
      cashSales: 0,
      electronicSales: 0,
      expenses: 0,
      expectedCash: 0,
      status: 'closed',
      openedAt: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    },
    movements: [],
    products: [], // Catálogo en 0 para nuevo bar
    sessions: [],
    suppliers: [],
    purchases: [],
    inventoryMovements: [],
    closedSales: [],
    settings: {
      barName: cleanName,
      nit: 'Pendiente por registrar',
      address: params.address ? `${params.address}, ${params.city || ''}` : `${params.city || 'Colombia'}`,
      phone: params.phone || '+57 (300) 000-0000',
      footerText: `¡Gracias por tu visita a ${cleanName}! Vuelve pronto.`,
      tipPercentage: 10,
      taxPercentage: 8,
    },
  }

  saveBarData(cleanData)

  if (params.businessId) {
    saveCloudBarData(params.businessId, cleanData).catch(() => {})
  }
}

// Cargar plantilla opcional de bebidas estándar colombianas
export function loadSuggestedProductsTemplate(): void {
  const data = loadBarData()
  data.products = INITIAL_PRODUCTS
  saveBarData(data)
}

// Limpiar datos de operaciones para empezar en blanco la prueba de la noche
export function clearOperationalDataOnly(): void {
  const data = loadBarData()
  data.tables = DEFAULT_BAR_DATA.tables.map((t) => ({
    ...t,
    status: 'available' as const,
    items: [],
    payments: [],
    total: 0,
    paid: 0,
    pending: 0,
    openedAt: undefined,
  }))
  data.cash = {
    ...DEFAULT_BAR_DATA.cash,
    cashSales: 0,
    electronicSales: 0,
    expenses: 0,
    expectedCash: data.cash.initialCash || 0,
  }
  data.movements = []
  data.closedSales = []
  saveBarData(data)
}

export function setActiveTableId(id: number): void {
  const data = loadBarData()
  data.activeTableId = id
  saveBarData(data)
}

// Agregar producto a una mesa
export function addItemToTable(tableId: number, product: ProductState, quantity: number = 1): void {
  const data = loadBarData()
  const timeNow = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  data.tables = data.tables.map((t) => {
    if (t.id === tableId) {
      const currentItems = [...(t.items || [])]
      const existingIdx = currentItems.findIndex((it) => it.productId === product.id)

      if (existingIdx >= 0) {
        const item = currentItems[existingIdx]
        const newQty = item.quantity + quantity
        currentItems[existingIdx] = {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.unitPrice,
        }
      } else {
        currentItems.push({
          productId: product.id,
          name: product.name,
          quantity,
          unitPrice: product.price,
          subtotal: quantity * product.price,
        })
      }

      const totalAmount = currentItems.reduce((acc, it) => acc + it.subtotal, 0)
      const paid = t.paid || 0
      const pending = Math.max(0, totalAmount - paid)

      return {
        ...t,
        status: 'occupied',
        openedAt: t.openedAt || timeNow,
        items: currentItems,
        total: totalAmount,
        paid,
        pending,
      }
    }
    return t
  })

  // Ajustar existencias
  data.products = (data.products || INITIAL_PRODUCTS).map((p) => {
    if (p.id === product.id) {
      return { ...p, stock: Math.max(0, p.stock - quantity) }
    }
    return p
  })

  data.activeTableId = tableId
  saveBarData(data)
}

// Cambiar cantidad de un producto en la mesa
export function updateTableItemQty(tableId: number, productId: string, delta: number): void {
  const data = loadBarData()

  data.tables = data.tables.map((t) => {
    if (t.id === tableId) {
      const updatedItems: OrderItemState[] = []
      for (const it of t.items || []) {
        if (it.productId === productId) {
          const newQty = it.quantity + delta
          if (newQty > 0) {
            updatedItems.push({
              ...it,
              quantity: newQty,
              subtotal: newQty * it.unitPrice,
            })
          }
        } else {
          updatedItems.push(it)
        }
      }

      const totalAmount = updatedItems.reduce((acc, it) => acc + it.subtotal, 0)
      const paid = t.paid || 0
      const pending = Math.max(0, totalAmount - paid)
      const isOccupied = updatedItems.length > 0 || paid > 0

      return {
        ...t,
        status: isOccupied ? 'occupied' : 'available',
        openedAt: isOccupied ? t.openedAt : undefined,
        items: updatedItems,
        total: totalAmount,
        paid,
        pending,
      }
    }
    return t
  })

  // Ajustar stock
  data.products = (data.products || INITIAL_PRODUCTS).map((p) => {
    if (p.id === productId) {
      return { ...p, stock: Math.max(0, p.stock - delta) }
    }
    return p
  })

  data.activeTableId = tableId
  saveBarData(data)
}

// Eliminar un producto específico de la mesa
export function removeTableItem(tableId: number, productId: string): void {
  const data = loadBarData()
  let qtyToReturn = 0

  data.tables = data.tables.map((t) => {
    if (t.id === tableId) {
      const found = (t.items || []).find((it) => it.productId === productId)
      if (found) qtyToReturn = found.quantity

      const filtered = (t.items || []).filter((it) => it.productId !== productId)
      const totalAmount = filtered.reduce((acc, it) => acc + it.subtotal, 0)
      const paid = t.paid || 0
      const pending = Math.max(0, totalAmount - paid)
      const isOccupied = filtered.length > 0 || paid > 0

      return {
        ...t,
        status: isOccupied ? 'occupied' : 'available',
        openedAt: isOccupied ? t.openedAt : undefined,
        items: filtered,
        total: totalAmount,
        paid,
        pending,
      }
    }
    return t
  })

  if (qtyToReturn > 0) {
    data.products = (data.products || INITIAL_PRODUCTS).map((p) => {
      if (p.id === productId) {
        return { ...p, stock: p.stock + qtyToReturn }
      }
      return p
    })
  }

  data.activeTableId = tableId
  saveBarData(data)
}

// Vaciar comanda completa de una mesa
export function clearTableOrder(tableId: number): void {
  const data = loadBarData()
  const table = data.tables.find((t) => t.id === tableId)
  const items = table?.items || []

  // Devolver todo el stock
  const returnMap = new Map<string, number>()
  for (const it of items) {
    returnMap.set(it.productId, (returnMap.get(it.productId) || 0) + it.quantity)
  }

  data.products = (data.products || INITIAL_PRODUCTS).map((p) => {
    const qty = returnMap.get(p.id)
    if (qty) {
      return { ...p, stock: p.stock + qty }
    }
    return p
  })

  data.tables = data.tables.map((t) => {
    if (t.id === tableId) {
      return {
        ...t,
        status: 'available',
        openedAt: undefined,
        items: [],
        payments: [],
        total: 0,
        paid: 0,
        pending: 0,
      }
    }
    return t
  })

  data.activeTableId = tableId
  saveBarData(data)
}

// Apertura de turno de caja
export function openCashShift(initialBase: number, operatorName?: string): CashSessionRecord {
  const data = loadBarData()
  const timeNow = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const sessionId = 'ses-' + Date.now()
  const operator = operatorName || data.operatorName || 'Cajero Principal'

  data.cash = {
    initialCash: initialBase,
    cashSales: 0,
    electronicSales: 0,
    expenses: 0,
    expectedCash: initialBase,
    status: 'open',
    openedAt: timeNow,
    currentSessionId: sessionId,
  }

  const openMovement: CashMovementRecord = {
    id: 'mov-' + Date.now(),
    type: 'in',
    category: 'Base Inicial',
    description: `Apertura de turno (Base: $ ${initialBase.toLocaleString('es-CO')})`,
    amount: initialBase,
    time: timeNow,
    user: operator,
  }

  data.movements = [openMovement, ...(data.movements || [])]

  const newSession: CashSessionRecord = {
    id: sessionId,
    openedAt: `Hoy, ${timeNow}`,
    operator,
    initialCash: initialBase,
    cashSales: 0,
    electronicSales: 0,
    expenses: 0,
    expectedCash: initialBase,
    status: 'open',
  }

  saveBarData(data)
  return newSession
}

// Cierre de turno de caja y arqueo
export function closeCashShift(actualCash: number, notes?: string): CashSessionRecord {
  const data = loadBarData()
  const timeNow = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const expected = data.cash.expectedCash
  const difference = actualCash - expected

  const closedSession: CashSessionRecord = {
    id: data.cash.currentSessionId || ('ses-' + Date.now()),
    openedAt: data.cash.openedAt.startsWith('Hoy') ? data.cash.openedAt : `Hoy, ${data.cash.openedAt}`,
    closedAt: `Hoy, ${timeNow}`,
    operator: data.operatorName || 'Cajero Principal',
    initialCash: data.cash.initialCash,
    cashSales: data.cash.cashSales,
    electronicSales: data.cash.electronicSales,
    expenses: data.cash.expenses,
    expectedCash: expected,
    actualCash,
    difference,
    notes: notes || (difference === 0 ? 'Cuadre exacto sin novedades.' : difference > 0 ? `Sobrante de $ ${difference.toLocaleString('es-CO')}` : `Faltante de $ ${Math.abs(difference).toLocaleString('es-CO')}`),
    status: 'closed',
  }

  data.sessions = [closedSession, ...(data.sessions || [])]
  data.cash.status = 'closed'

  const closeMovement: CashMovementRecord = {
    id: 'mov-' + Date.now(),
    type: 'out',
    category: 'Arqueo de Cierre',
    description: `Cierre de turno: Contado $ ${actualCash.toLocaleString('es-CO')} (${difference === 0 ? 'Cuadre exacto' : difference > 0 ? 'Sobrante' : 'Faltante'})`,
    amount: 0,
    time: timeNow,
    user: data.operatorName,
  }

  data.movements = [closeMovement, ...(data.movements || [])]

  saveBarData(data)
  return closedSession
}

// Registro de gastos o ingresos menores de caja
export function addCashMovement(type: 'in' | 'out', category: string, amount: number, description: string): void {
  const data = loadBarData()
  const timeNow = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  if (type === 'out') {
    data.cash.expenses += amount
    data.cash.expectedCash = Math.max(0, data.cash.expectedCash - amount)
  } else {
    data.cash.expectedCash += amount
  }

  const movement: CashMovementRecord = {
    id: 'mov-' + Date.now(),
    type,
    category,
    description,
    amount: type === 'out' ? -amount : amount,
    time: timeNow,
    user: data.operatorName,
  }

  data.movements = [movement, ...(data.movements || [])]
  saveBarData(data)
}

// === FUNCIONES ETAPA 7: PROVEEDORES, COMPRAS E INVENTARIO ===

// Agregar un nuevo proveedor
export function addSupplier(supplier: Omit<SupplierState, 'id'>): SupplierState {
  const data = loadBarData()
  const newSupplier: SupplierState = {
    ...supplier,
    id: 'sup-' + Date.now(),
  }
  data.suppliers = [newSupplier, ...(data.suppliers || INITIAL_SUPPLIERS)]
  saveBarData(data)
  return newSupplier
}

// Actualizar un proveedor existente
export function updateSupplier(id: string, updates: Partial<SupplierState>): void {
  const data = loadBarData()
  data.suppliers = (data.suppliers || INITIAL_SUPPLIERS).map((s) => {
    if (s.id === id) {
      return { ...s, ...updates }
    }
    return s
  })
  saveBarData(data)
}

// Eliminar un proveedor
export function deleteSupplier(id: string): void {
  const data = loadBarData()
  data.suppliers = (data.suppliers || INITIAL_SUPPLIERS).filter((s) => s.id !== id)
  saveBarData(data)
}

// Registrar una compra de reabastecimiento a proveedor
export function registerPurchase(purchaseData: Omit<PurchaseRecord, 'id' | 'date' | 'user'>): PurchaseRecord {
  const data = loadBarData()
  const timeNow = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const dateStr = `Hoy, ${timeNow}`
  const user = data.operatorName || 'Cajero Principal'
  const purchaseId = 'OC-' + (100 + (data.purchases?.length || 0) + 1)

  const newPurchase: PurchaseRecord = {
    ...purchaseData,
    id: purchaseId,
    date: dateStr,
    user,
  }

  // Actualizar existencias y costo unitario de cada producto comprado
  data.products = (data.products || INITIAL_PRODUCTS).map((p) => {
    const purchasedItem = purchaseData.items.find((it) => it.productId === p.id)
    if (purchasedItem) {
      const newStock = p.stock + purchasedItem.quantity
      const newCost = purchasedItem.unitCost > 0 ? purchasedItem.unitCost : p.cost

      // Registrar movimiento en el kardex
      const invMov: InventoryMovementRecord = {
        id: 'inv-' + Date.now() + '-' + p.id,
        productId: p.id,
        productName: p.name,
        type: 'purchase',
        quantity: purchasedItem.quantity,
        reason: `Compra ${purchaseId} a ${purchaseData.supplierName}${purchaseData.invoiceNumber ? ` (Fact: ${purchaseData.invoiceNumber})` : ''}`,
        time: dateStr,
        user,
        resultingStock: newStock,
      }
      data.inventoryMovements = [invMov, ...(data.inventoryMovements || [])]

      return {
        ...p,
        stock: newStock,
        cost: newCost,
      }
    }
    return p
  })

  // Si se pagó con Efectivo de Caja, registrar el egreso en caja
  if (purchaseData.paymentMethod === 'Efectivo Caja' && purchaseData.totalAmount > 0) {
    data.cash.expenses += purchaseData.totalAmount
    data.cash.expectedCash = Math.max(0, data.cash.expectedCash - purchaseData.totalAmount)
    data.movements.unshift({
      id: 'mov-' + Date.now(),
      type: 'out',
      category: 'Pago Proveedor',
      description: `Compra ${purchaseId} a ${purchaseData.supplierName}`,
      amount: -purchaseData.totalAmount,
      time: timeNow,
      user,
    })
  }

  data.purchases = [newPurchase, ...(data.purchases || [])]
  saveBarData(data)
  return newPurchase
}

// Registrar ajuste manual de inventario (merma, rotura o conteo físico)
export function registerInventoryAdjustment(
  productId: string,
  type: 'loss' | 'adjustment',
  quantity: number,
  reason: string
): void {
  const data = loadBarData()
  const timeNow = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const dateStr = `Hoy, ${timeNow}`
  const user = data.operatorName || 'Cajero Principal'

  data.products = (data.products || INITIAL_PRODUCTS).map((p) => {
    if (p.id === productId) {
      const newStock = Math.max(0, p.stock + quantity)

      const invMov: InventoryMovementRecord = {
        id: 'inv-' + Date.now(),
        productId: p.id,
        productName: p.name,
        type,
        quantity,
        reason,
        time: dateStr,
        user,
        resultingStock: newStock,
      }
      data.inventoryMovements = [invMov, ...(data.inventoryMovements || [])]

      return {
        ...p,
        stock: newStock,
      }
    }
    return p
  })

  saveBarData(data)
}

export function resetBarData(): BarData {
  saveBarData(DEFAULT_BAR_DATA)
  return DEFAULT_BAR_DATA
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  const handler = () => callback()
  if (typeof window !== 'undefined') {
    window.addEventListener('rock_bar_state_updated', handler)
    window.addEventListener('storage', handler)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== 'undefined') {
      window.removeEventListener('rock_bar_state_updated', handler)
      window.removeEventListener('storage', handler)
    }
  }
}

export function useBarStore(): BarData {
  return useSyncExternalStore(subscribe, loadBarData, () => DEFAULT_BAR_DATA)
}
