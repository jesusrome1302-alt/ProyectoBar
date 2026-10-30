-- =========================================================================
-- SISTEMA DE GESTIÓN DE BAR - SINCRONIZACIÓN MULTI-DISPOSITIVO EN LA NUBE
-- =========================================================================

-- 1. Tabla de cuentas comerciales registradas (Dueños y Bares)
create table if not exists public.bar_accounts (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    password text not null,
    pin text not null,
    full_name text not null,
    bar_name text not null,
    phone text,
    city text,
    role text not null default 'owner',
    business_id uuid default gen_random_uuid() not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla de miembros del equipo por bar (Meseros, Cajeros, Administradores)
create table if not exists public.bar_team_members (
    id text primary key,
    business_id uuid not null references public.bar_accounts(business_id) on delete cascade,
    name text not null,
    email text,
    role text not null check (role in ('admin', 'staff', 'owner')),
    role_title text,
    pin text not null,
    avatar text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabla de estado operativo en tiempo real del bar (Mesas, Caja, Productos, etc.)
create table if not exists public.bar_data (
    business_id uuid primary key references public.bar_accounts(business_id) on delete cascade,
    data jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Habilitar Row Level Security (RLS) con políticas de acceso para clientes del bar
alter table public.bar_accounts enable row level security;
alter table public.bar_team_members enable row level security;
alter table public.bar_data enable row level security;

-- Políticas para bar_accounts
drop policy if exists "Permitir lectura de cuentas" on public.bar_accounts;
create policy "Permitir lectura de cuentas" on public.bar_accounts for select using (true);

drop policy if exists "Permitir insercion de cuentas" on public.bar_accounts;
create policy "Permitir insercion de cuentas" on public.bar_accounts for insert with check (true);

drop policy if exists "Permitir actualizacion de cuentas" on public.bar_accounts;
create policy "Permitir actualizacion de cuentas" on public.bar_accounts for update using (true);

-- Políticas para bar_team_members
drop policy if exists "Permitir lectura de miembros" on public.bar_team_members;
create policy "Permitir lectura de miembros" on public.bar_team_members for select using (true);

drop policy if exists "Permitir insercion de miembros" on public.bar_team_members;
create policy "Permitir insercion de miembros" on public.bar_team_members for insert with check (true);

drop policy if exists "Permitir actualizacion de miembros" on public.bar_team_members;
create policy "Permitir actualizacion de miembros" on public.bar_team_members for update using (true);

drop policy if exists "Permitir eliminacion de miembros" on public.bar_team_members;
create policy "Permitir eliminacion de miembros" on public.bar_team_members for delete using (true);

-- Políticas para bar_data
drop policy if exists "Permitir lectura de bar_data" on public.bar_data;
create policy "Permitir lectura de bar_data" on public.bar_data for select using (true);

drop policy if exists "Permitir guardado de bar_data" on public.bar_data;
create policy "Permitir guardado de bar_data" on public.bar_data for all using (true) with check (true);
