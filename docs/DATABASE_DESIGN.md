# Diseño Preliminar de Base de Datos - Sistema de Gestión de Bar

Este documento describe el esquema relacional inicial para Supabase (PostgreSQL), incluyendo las tablas principales, relaciones, restricciones y la base para las políticas de seguridad (Row Level Security - RLS).

## 1. Entidades Principales

### 1.1 `businesses`
Datos del negocio o establecimiento.
- `id` (UUID, PK)
- `name` (VARCHAR, NOT NULL) - Nombre del bar
- `tax_id` (VARCHAR) - NIT o documento tributario
- `created_at` (TIMESTAMPTZ)

### 1.2 `profiles` y Roles
Usuarios asociados a un negocio con roles específicos.
- `id` (UUID, PK, referencia a `auth.users`)
- `business_id` (UUID, FK a `businesses`)
- `full_name` (VARCHAR, NOT NULL)
- `role` (VARCHAR, NOT NULL) - Valores: `owner`, `admin`, `staff`
- `active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ)

### 1.3 `tables`
Mesas del establecimiento (1 a 9 inicialmente).
- `id` (UUID, PK)
- `business_id` (UUID, FK)
- `name` (VARCHAR, NOT NULL) - Ej. "Mesa 1", "Barra 1"
- `capacity` (INTEGER)
- `status` (VARCHAR, NOT NULL) - Valores: `available`, `occupied`, `reserved`
- `created_at` (TIMESTAMPTZ)

### 1.4 `categories`
Categorías de productos para el catálogo.
- `id` (UUID, PK)
- `business_id` (UUID, FK)
- `name` (VARCHAR, NOT NULL)
- `sort_order` (INTEGER, DEFAULT 0)

### 1.5 `products`
Catálogo de productos (bebidas, licores, snacks, etc.).
- `id` (UUID, PK)
- `business_id` (UUID, FK)
- `category_id` (UUID, FK)
- `name` (VARCHAR, NOT NULL)
- `barcode` (VARCHAR)
- `price` (NUMERIC(12, 2), NOT NULL) - Precio de venta actual
- `cost` (NUMERIC(12, 2), NOT NULL) - Costo de adquisición
- `stock` (NUMERIC(12, 3), DEFAULT 0) - Existencias actuales
- `min_stock` (NUMERIC(12, 3), DEFAULT 0) - Stock mínimo para alertas
- `active` (BOOLEAN, DEFAULT TRUE)

### 1.6 `orders` y `order_items`
Cuentas y pedidos en mesas o ventas directas.
- **`orders`**:
  - `id` (UUID, PK)
  - `business_id` (UUID, FK)
  - `table_id` (UUID, FK, NULL para venta directa)
  - `profile_id` (UUID, FK a `profiles`) - Mesero/cajero que abrió
  - `status` (VARCHAR) - `open`, `paid`, `cancelled`
  - `total_amount` (NUMERIC(12, 2), DEFAULT 0)
  - `created_at` (TIMESTAMPTZ), `closed_at` (TIMESTAMPTZ)

- **`order_items`**:
  - `id` (UUID, PK)
  - `order_id` (UUID, FK)
  - `product_id` (UUID, FK)
  - `product_name` (VARCHAR) - **Nombre histórico**
  - `unit_price` (NUMERIC(12, 2)) - **Precio histórico aplicado**
  - `quantity` (NUMERIC(12, 3))
  - `subtotal` (NUMERIC(12, 2))
  - `notes` (TEXT)

### 1.7 `payments`
Pagos asociados a las cuentas.
- `id` (UUID, PK)
- `order_id` (UUID, FK)
- `profile_id` (UUID, FK)
- `amount` (NUMERIC(12, 2), NOT NULL)
- `payment_method` (VARCHAR, NOT NULL) - `cash`, `transfer`, `card`, etc.
- `created_at` (TIMESTAMPTZ)

### 1.8 `cash_sessions` y `cash_movements`
Control de caja y turnos.
- **`cash_sessions`**:
  - `id` (UUID, PK)
  - `business_id` (UUID, FK)
  - `opened_by` (UUID, FK), `closed_by` (UUID, FK)
  - `initial_cash` (NUMERIC(12, 2))
  - `expected_cash` (NUMERIC(12, 2))
  - `final_cash` (NUMERIC(12, 2))
  - `status` (VARCHAR) - `open`, `closed`
  - `opened_at` (TIMESTAMPTZ), `closed_at` (TIMESTAMPTZ)

- **`cash_movements`**:
  - `id` (UUID, PK)
  - `cash_session_id` (UUID, FK)
  - `profile_id` (UUID, FK)
  - `type` (VARCHAR) - `in`, `out`, `expense`, `withdrawal`
  - `amount` (NUMERIC(12, 2))
  - `reason` (TEXT)

### 1.9 `suppliers`, `purchases`, `purchase_items`
Gestión de proveedores y compras de mercancía.

### 1.10 `inventory_movements`
Trazabilidad de entradas, salidas, pérdidas y ajustes de stock.

### 1.11 `audit_logs` y `settings`
Registro de acciones sensibles y configuración general del negocio.

## 2. Consideraciones de Seguridad y RLS
- Todas las tablas principales contendrán una columna `business_id`.
- Las políticas de **Row Level Security (RLS)** en Supabase garantizarán que un usuario autenticado solo pueda consultar o mutar registros donde `business_id` coincida con el negocio al que pertenece su perfil (`profiles.business_id`).
