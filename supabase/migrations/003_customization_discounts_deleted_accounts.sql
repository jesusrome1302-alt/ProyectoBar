-- =========================================================================
-- MIGRACIÓN 003: DESCUENTOS/HAPPY HOURS, CATEGORÍAS, TEMAS Y CUENTAS ELIMINADAS
-- =========================================================================

-- 1. Tabla de auditoría y archivo de cuentas eliminadas (Usuarios / Bares Eliminados)
create table if not exists public.deleted_bar_accounts (
    id uuid default gen_random_uuid() primary key,
    original_account_id text,
    business_id uuid not null,
    email text not null,
    full_name text not null,
    bar_name text not null,
    phone text,
    city text,
    deletion_reason text default 'Eliminación solicitada por el propietario con verificación de PIN',
    pin_verified boolean not null default true,
    final_snapshot jsonb,
    deleted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar RLS en deleted_bar_accounts
alter table public.deleted_bar_accounts enable row level security;

drop policy if exists "Permitir insercion en deleted_bar_accounts" on public.deleted_bar_accounts;
create policy "Permitir insercion en deleted_bar_accounts" on public.deleted_bar_accounts for insert with check (true);

drop policy if exists "Permitir lectura en deleted_bar_accounts" on public.deleted_bar_accounts;
create policy "Permitir lectura en deleted_bar_accounts" on public.deleted_bar_accounts for select using (true);

-- 3. Permitir eliminación verificada en bar_accounts y bar_data
drop policy if exists "Permitir eliminacion de cuentas" on public.bar_accounts;
create policy "Permitir eliminacion de cuentas" on public.bar_accounts for delete using (true);

drop policy if exists "Permitir eliminacion de bar_data" on public.bar_data;
create policy "Permitir eliminacion de bar_data" on public.bar_data for delete using (true);

