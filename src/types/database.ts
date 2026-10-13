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
  stock: number
  min_stock: number
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
