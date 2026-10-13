-- =========================================================================
-- SISTEMA DE GESTIÓN DE BAR - SCRIPT DE MIGRACIÓN INICIAL (Supabase / PostgreSQL)
-- =========================================================================

-- 1. Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- 2. Tabla de Negocios (Multi-tenant)
create table public.businesses (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    tax_id varchar(100),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabla de Perfiles de Usuario (Vinculada a auth.users de Supabase)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    full_name varchar(255) not null,
    role varchar(50) not null check (role in ('owner', 'admin', 'staff')),
    active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabla de Mesas (1 a 9 iniciales)
create table public.tables (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    name varchar(100) not null,
    capacity integer default 4 not null,
    status varchar(50) default 'available' not null check (status in ('available', 'occupied', 'reserved')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Categorías de Productos
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    name varchar(150) not null,
    sort_order integer default 0 not null
);

-- 6. Catálogo de Productos
create table public.products (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete set null,
    name varchar(255) not null,
    barcode varchar(100),
    price numeric(12, 2) not null check (price >= 0),
    cost numeric(12, 2) not null check (cost >= 0),
    stock numeric(12, 3) default 0 not null,
    min_stock numeric(12, 3) default 0 not null,
    active boolean default true not null
);

-- 7. Órdenes / Cuentas (Mesas o Venta Directa)
create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    table_id uuid references public.tables(id) on delete set null,
    profile_id uuid references public.profiles(id) not null,
    status varchar(50) default 'open' not null check (status in ('open', 'paid', 'cancelled')),
    total_amount numeric(12, 2) default 0 not null check (total_amount >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    closed_at timestamp with time zone
);

-- 8. Detalles de la Orden (Artículos con precio histórico)
create table public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete restrict not null,
    product_name varchar(255) not null,
    unit_price numeric(12, 2) not null check (unit_price >= 0),
    quantity numeric(12, 3) not null check (quantity > 0),
    subtotal numeric(12, 2) not null check (subtotal >= 0),
    notes text
);

-- 9. Pagos
create table public.payments (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    profile_id uuid references public.profiles(id) not null,
    amount numeric(12, 2) not null check (amount > 0),
    payment_method varchar(50) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Turnos de Caja y Movimientos
create table public.cash_sessions (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    opened_by uuid references public.profiles(id) not null,
    closed_by uuid references public.profiles(id),
    initial_cash numeric(12, 2) default 0 not null,
    expected_cash numeric(12, 2) default 0 not null,
    final_cash numeric(12, 2),
    status varchar(50) default 'open' not null check (status in ('open', 'closed')),
    opened_at timestamp with time zone default timezone('utc'::text, now()) not null,
    closed_at timestamp with time zone
);

create table public.cash_movements (
    id uuid default uuid_generate_v4() primary key,
    cash_session_id uuid references public.cash_sessions(id) on delete cascade not null,
    profile_id uuid references public.profiles(id) not null,
    type varchar(50) not null check (type in ('in', 'out', 'expense', 'withdrawal')),
    amount numeric(12, 2) not null,
    reason text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Proveedores, Compras y Movimientos de Inventario
create table public.suppliers (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    name varchar(255) not null,
    contact_info varchar(255)
);

create table public.inventory_movements (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    profile_id uuid references public.profiles(id) not null,
    type varchar(50) not null check (type in ('purchase', 'sale', 'loss', 'adjustment')),
    quantity numeric(12, 3) not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Auditoría y Configuración
create table public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    profile_id uuid references public.profiles(id),
    action varchar(100) not null,
    details text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.settings (
    business_id uuid references public.businesses(id) on delete cascade primary key,
    receipt_footer text,
    tax_rate numeric(5, 2) default 0 not null
);


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) - SEGURIDAD POR NEGOCIO
-- =========================================================================

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.tables enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.cash_sessions enable row level security;
alter table public.cash_movements enable row level security;
alter table public.suppliers enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.audit_logs enable row level security;
alter table public.settings enable row level security;

-- Función auxiliar para obtener el business_id del usuario autenticado actual
create or replace function public.get_user_business_id()
returns uuid
language sql security definer
as $$
  select business_id from public.profiles where id = auth.uid() limit 1;
$$;

-- Nota: Las políticas RLS detalladas se aplicarán con funciones de aislamiento por business_id
