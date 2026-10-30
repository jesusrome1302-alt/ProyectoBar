export type Role = 'owner' | 'admin' | 'staff'

export interface Business {
  id: string
  name: string
  tax_id?: string
  created_at: string
}

export interface Profile {
  id: string
  business_id: string
  full_name: string
  role: Role
  active: boolean
  created_at: string
}

export interface Table {
  id: string
  business_id: string
  name: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  created_at: string
}

export interface Category {
  id: string
  business_id: string
  name: string
  sort_order: number
}

export interface Product {
  id: string
  business_id: string
  category_id: string
  name: string
  barcode?: string
  price: number
  cost: number
  stock: number // Total (stock_nevera + stock_bodega)
  stock_nevera?: number
  stock_bodega?: number
  min_stock: number // Alerta compra proveedor
  min_stock_nevera?: number // Alerta reponer nevera / enfriar
  active: boolean
}

export interface Order {
  id: string
  business_id: string
  table_id?: string
  profile_id: string
  status: 'open' | 'paid' | 'cancelled'
  total_amount: number
  created_at: string
  closed_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  subtotal: number
  notes?: string
}

export interface Payment {
  id: string
  order_id: string
  profile_id: string
  amount: number
  payment_method: string
  created_at: string
}

export interface CashSession {
  id: string
  business_id: string
  opened_by: string
  closed_by?: string
  initial_cash: number
  expected_cash: number
  final_cash?: number
  status: 'open' | 'closed'
  opened_at: string
  closed_at?: string
}

export interface CashMovement {
  id: string
  cash_session_id: string
  profile_id: string
  type: 'in' | 'out' | 'expense' | 'withdrawal'
  amount: number
  reason: string
  created_at: string
}

export interface Supplier {
  id: string
  business_id: string
  name: string
  contact_info?: string
}

export interface InventoryMovement {
  id: string
  business_id: string
  product_id: string
  profile_id: string
  type: 'purchase' | 'sale' | 'loss' | 'adjustment'
  quantity: number
  notes?: string
  created_at: string
}

export interface AuditLog {
  id: string
  business_id: string
  profile_id?: string
  action: string
  details?: string
  created_at: string
}

export interface Settings {
  business_id: string
  receipt_footer?: string
  tax_rate: number
}

