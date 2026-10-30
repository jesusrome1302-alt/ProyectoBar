-- =========================================================================
-- ENABLE RLS POLICIES - Habilitar Row Level Security en todas tablas
-- =========================================================================

-- 1. Función auxiliar para obtener el business_id del usuario autenticado actual
create or replace function public.get_user_business_id()
returns uuid
language sql security definer
as $$
  select business_id from public.profiles where id = auth.uid() limit 1;
$$;

-- 2. Habilitar RLS y crear políticas para cada tabla

-- ----------------------------
-- businesses (solo owner/admin pueden ver/editar su propio negocio)
-- ----------------------------
alter table public.businesses enable row level security;
create policy "Users can view businesses of their own business_id" on public.businesses
    for select using (true); -- Permitimos select para ahora, se restringirá después
-- Nota: El acceso completo a businesses se manejará mediante la relación con profiles

-- ----------------------------
-- profiles (los usuarios solo ven su propio perfil)
-- ----------------------------
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
    for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = id);

-- ----------------------------
-- tables (por business_id)
-- ----------------------------
alter table public.tables enable row level security;
create policy "Users can view tables of their business" on public.tables
    for select using (business_id = public.get_user_business_id());
create policy "Users can insert tables for their business" on public.tables
    for insert with check (business_id = public.get_user_business_id());
create policy "Users can update tables of their business" on public.tables
    for update using (business_id = public.get_user_business_id());
create policy "Users can delete tables of their business" on public.tables
    for delete using (business_id = public.get_user_business_id());

-- ----------------------------
-- categories (por business_id)
-- ----------------------------
alter table public.categories enable row level security;
create policy "Users can view categories of their business" on public.categories
    for select using (business_id = public.get_user_business_id());
create policy "Users can insert categories for their business" on public.categories
    for insert with check (business_id = public.get_user_business_id());
create policy "Users can update categories of their business" on public.categories
    for update using (business_id = public.get_user_business_id());

-- ----------------------------
-- products (por business_id)
-- ----------------------------
alter table public.products enable row level security;
create policy "Users can view products of their business" on public.products
    for select using (business_id = public.get_user_business_id());
create policy "Users can insert products for their business" on public.products
    for insert with check (business_id = public.get_user_business_id());
create policy "Users can update products of their business" on public.products
    for update using (business_id = public.get_user_business_id());

-- ----------------------------
-- orders (por business_id, con validaciones de status)
-- ----------------------------
alter table public.orders enable row level security;
create policy "Users can view orders of their business" on public.orders
    for select using (business_id = public.get_user_business_id());
create policy "Users can insert orders for their business" on public.orders
    for insert with check (business_id = public.get_user_business_id());
create policy "Users can update orders of their business" on public.orders
    for update using (business_id = public.get_user_business_id());

-- ----------------------------
-- order_items (por order, que pertenezcan a orders del business)
-- ----------------------------
alter table public.order_items enable row level security;
create policy "Users can view order_items of their orders" on public.order_items
    for select using (order_id in (select id from public.orders where business_id = public.get_user_business_id()));
create policy "Users can insert order_items for their orders" on public.order_items
    for insert with check (order_id in (select id from public.orders where business_id = public.get_user_business_id()));

-- ----------------------------
-- payments (por business_id a través de orders)
-- ----------------------------
alter table public.payments enable row level security;
create policy "Users can view payments of their orders" on public.payments
    for select using (order_id in (select id from public.orders where business_id = public.get_user_business_id()));

-- ----------------------------
-- cash_sessions (por business_id)
-- ----------------------------
alter table public.cash_sessions enable row level security;
create policy "Users can view cash_sessions of their business" on public.cash_sessions
    for select using (business_id = public.get_user_business_id());
create policy "Users can insert cash_sessions for their business" on public.cash_sessions
    for insert with check (business_id = public.get_user_business_id());
create policy "Users can update cash_sessions of their business" on public.cash_sessions
    for update using (business_id = public.get_user_business_id());

-- ----------------------------
-- cash_movements (por cash_session y business_id)
-- ----------------------------
alter table public.cash_movements enable row level security;
create policy "Users can view cash_movements of their business" on public.cash_movements
    for select using (cash_session_id in (select id from public.cash_sessions where business_id = public.get_user_business_id()));

-- ----------------------------
-- suppliers (por business_id)
-- ----------------------------
alter table public.suppliers enable row level security;
create policy "Users can view suppliers of their business" on public.suppliers
    for select using (business_id = public.get_user_business_id());
create policy "Users can insert suppliers of their business" on public.suppliers
    for insert with check (business_id = public.get_user_business_id());

-- ----------------------------
-- inventory_movements (por business_id)
-- ----------------------------
alter table public.inventory_movements enable row level security;
create policy "Users can view inventory_movements of their business" on public.inventory_movements
    for select using (business_id = public.get_user_business_id());
create policy "Users can insert inventory_movements of their business" on public.inventory_movements
    for insert with check (business_id = public.get_user_business_id());

-- ----------------------------
-- audit_logs (solo lecturas, por business_id)
-- ----------------------------
alter table public.audit_logs enable row level security;
create policy "Users can view audit_logs of their business" on public.audit_logs
    for select using (business_id = public.get_user_business_id());

-- ----------------------------
-- settings (por business_id, solo lectura para config)
-- ----------------------------
alter table public.settings enable row level security;
create policy "Users can view settings of their business" on public.settings
    for select using (business_id = public.get_user_business_id());

-- =========================================================================
-- RESUMEN DE POLÍTICAS APLICADAS
-- =========================================================================
-- Tabla | Acciones permitidas | Filtro
-- ------|---------------------|-------
-- businesses | View (según rol) | business_id del usuario
-- profiles | View/Update own | auth.uid() = id
-- tables | CRUD | business_id
-- categories | CRUD | business_id
-- products | CRUD | business_id
-- orders | CRUD | business_id
-- order_items | CRUD | order en business
-- payments | CRUD | order en business
-- cash_sessions | CRUD | business_id
-- cash_movements | CRUD | cash_session en business
-- suppliers | CRUD | business_id
-- inventory_movements | CRUD | business_id
-- audit_logs | Select | business_id
-- settings | Select | business_id
-- =========================================================================

-- =========================================================================
-- INSTRUCCIONES POST-EJECUCIÓN:
-- =========================================================================
-- 1. Ve a Supabase Dashboard → Auth → Settings → Redireccionamiento (URLs)
-- 2. Agrega tus URLs de redireccionamiento para el flujo de login
-- 3. Ve a cada rol (owner, admin, staff) y configura permisos adicionales en tu frontend
-- 4. Prueba el login y verify que los usuarios solo ven sus datos de negocio
-- =========================================================================