import { useSyncExternalStore } from 'react'

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
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  openedAt?: string
  operator: string
  items: OrderItemState[]
  payments: PaymentRecord[]
  total: number
  paid: number
  pending: number
}

export interface CashState {
  initialCash: number
  cashSales: number
  electronicSales: number
  expenses: number
  expectedCash: number
  status: 'open' | 'closed'
  openedAt: string
}

export interface CashMovementRecord {
  id: string
  type: 'in' | 'out' | 'sale'
  description: string
  amount: number
  time: string
  user: string
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
}

export interface BarData {
  operatorName: string
  activeTableId?: number
  tables: TableState[]
  cash: CashState
  movements: CashMovementRecord[]
  products: ProductState[]
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

export const DEFAULT_BAR_DATA: BarData = {
  operatorName: 'Cajero Principal',
  activeTableId: 1,
  tables: [
    {
      id: 1,
      name: 'Mesa 1',
      capacity: 4,
      status: 'occupied',
      openedAt: '05:00 PM',
      operator: 'Cajero Principal',
      items: [
        { productId: 'prod-8', name: 'Trago Ron Medellín 8 Años', quantity: 4, unitPrice: 18000, subtotal: 72000 },
        { productId: 'prod-15', name: 'Alitas BBQ Rocker x8', quantity: 1, unitPrice: 34000, subtotal: 34000 },
        { productId: 'prod-16', name: 'Papas Rústicas con Tocineta', quantity: 1, unitPrice: 22000, subtotal: 22000 },
      ],
      payments: [],
      total: 128000,
      paid: 0,
      pending: 128000,
    },
    {
      id: 2,
      name: 'Mesa 2',
      capacity: 2,
      status: 'available',
      operator: 'Cajero Principal',
      items: [],
      payments: [],
      total: 0,
      paid: 0,
      pending: 0,
    },
    {
      id: 3,
      name: 'Mesa 3',
      capacity: 6,
      status: 'occupied',
      openedAt: '05:20 PM',
      operator: 'Cajero Principal',
      items: [
        { productId: 'prod-1', name: 'Corona Extra 355ml', quantity: 3, unitPrice: 14000, subtotal: 42000, notes: 'Bien frías' },
        { productId: 'prod-11', name: 'Cóctel Rock Margarita', quantity: 1, unitPrice: 32000, subtotal: 32000 },
        { productId: 'prod-17', name: 'Red Bull 250ml', quantity: 1, unitPrice: 15000, subtotal: 15000 },
      ],
      payments: [
        { id: 'p-1', method: 'Nequi / Daviplata', amount: 50000, timestamp: '05:40 PM', operator: 'Cajero Principal' },
      ],
      total: 89000,
      paid: 50000,
      pending: 39000,
    },
    {
      id: 4,
      name: 'Mesa 4',
      capacity: 4,
      status: 'available',
      operator: 'Cajero Principal',
      items: [],
      payments: [],
      total: 0,
      paid: 0,
      pending: 0,
    },
    {
      id: 5,
      name: 'Mesa 5',
      capacity: 8,
      status: 'occupied',
      openedAt: '04:15 PM',
      operator: 'Cajero Principal',
      items: [
        { productId: 'prod-7', name: 'Trago Whisky Johnnie Walker Black', quantity: 5, unitPrice: 28000, subtotal: 140000 },
        { productId: 'prod-14', name: 'Nachos Cheddar & Jalapeños', quantity: 2, unitPrice: 26000, subtotal: 52000 },
        { productId: 'prod-5', name: 'Poker Lata 330ml', quantity: 2, unitPrice: 8000, subtotal: 16000 },
      ],
      payments: [
        { id: 'p-2', method: 'Tarjeta Débito', amount: 150000, timestamp: '05:10 PM', operator: 'Cajero Principal' },
        { id: 'p-3', method: 'Efectivo', amount: 58000, timestamp: '05:30 PM', operator: 'Cajero Principal' },
      ],
      total: 208000,
      paid: 208000,
      pending: 0,
    },
    {
      id: 6,
      name: 'Mesa 6',
      capacity: 4,
      status: 'available',
      operator: 'Cajero Principal',
      items: [],
      payments: [],
      total: 0,
      paid: 0,
      pending: 0,
    },
    {
      id: 7,
      name: 'Mesa 7',
      capacity: 4,
      status: 'reserved',
      operator: 'Cajero Principal',
      items: [],
      payments: [],
      total: 0,
      paid: 0,
      pending: 0,
    },
    {
      id: 8,
      name: 'Mesa 8',
      capacity: 2,
      status: 'available',
      operator: 'Cajero Principal',
      items: [],
      payments: [],
      total: 0,
      paid: 0,
      pending: 0,
    },
    {
      id: 9,
      name: 'Mesa 9',
      capacity: 6,
      status: 'occupied',
      openedAt: '05:35 PM',
      operator: 'Cajero Principal',
      items: [
        { productId: 'prod-12', name: 'Mojito Cubano Clásico', quantity: 2, unitPrice: 28000, subtotal: 56000 },
      ],
      payments: [],
      total: 56000,
      paid: 0,
      pending: 56000,
    },
  ],
  cash: {
    initialCash: 150000,
    cashSales: 58000,
    electronicSales: 200000,
    expenses: 25000,
    expectedCash: 183000,
    status: 'open',
    openedAt: '04:00 PM',
  },
  movements: [
    { id: 'm-1', type: 'in', description: 'Base inicial de turno', amount: 150000, time: '04:00 PM', user: 'Cajero Principal' },
    { id: 'm-2', type: 'out', description: 'Compra de hielo de emergencia', amount: -25000, time: '04:45 PM', user: 'Cajero Principal' },
    { id: 'm-3', type: 'sale', description: 'Abono efectivo Mesa 5', amount: 58000, time: '05:30 PM', user: 'Cajero Principal' },
  ],
  products: INITIAL_PRODUCTS,
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
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = INITIAL_PRODUCTS
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
  } catch {
    // Ignorar cuota de localStorage
  }
}

export function addProductItem(item: Omit<ProductState, 'id'>): ProductState {
  const data = loadBarData()
  const newProduct: ProductState = {
    ...item,
    id: 'prod-' + Date.now(),
  }
  data.products = [newProduct, ...(data.products || INITIAL_PRODUCTS)]
  saveBarData(data)
  return newProduct
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
