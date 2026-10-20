-- Esquema base de la app de comercio exterior.
-- Cada usuario ve únicamente sus propias operaciones (Row Level Security).

create extension if not exists pgcrypto;

-- Catálogo canónico de etapas: plantilla global de solo lectura que se copia
-- al crear una operación. Es el "conocimiento de dominio" de la app.
create table if not exists public.catalogo_etapas (
  id uuid primary key default gen_random_uuid(),
  tipo_operacion text not null default 'importacion'
    check (tipo_operacion in ('importacion', 'exportacion')),
  orden integer not null,
  nombre text not null,
  organismo text,
  url text,
  plazo_dias integer not null default 7 check (plazo_dias >= 0),
  descripcion text,
  unique (tipo_operacion, orden)
);

-- Operaciones (expedientes) del usuario.
create table if not exists public.operaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  referencia text,
  descripcion text not null,
  proveedor text,
  pais_origen text,
  incoterm text,
  estado text not null default 'en_curso'
    check (estado in ('en_curso', 'cerrada', 'cancelada')),
  fecha_inicio date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Etapas de una operación (copia editable del catálogo).
create table if not exists public.etapas_operacion (
  id uuid primary key default gen_random_uuid(),
  operacion_id uuid not null references public.operaciones (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  orden integer not null,
  nombre text not null,
  organismo text,
  url text,
  fecha_limite date,
  completada boolean not null default false,
  completada_at timestamptz,
  notas text,
  unique (operacion_id, orden)
);

create index if not exists operaciones_user_id_idx
  on public.operaciones (user_id);
create index if not exists etapas_operacion_operacion_id_idx
  on public.etapas_operacion (operacion_id);
create index if not exists etapas_operacion_user_id_idx
  on public.etapas_operacion (user_id);

-- Mantiene updated_at al día.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists operaciones_set_updated_at on public.operaciones;
create trigger operaciones_set_updated_at
  before update on public.operaciones
  for each row execute function public.set_updated_at();

-- Privilegios de tabla: RLS filtra las filas, pero el GRANT es lo que habilita
-- la operación. En este setup de Supabase, el default de `public` no otorga CRUD.
grant usage on schema public to anon, authenticated;

grant select on public.catalogo_etapas to authenticated;

grant select, insert, update, delete on public.operaciones to authenticated;
grant select, insert, update, delete on public.etapas_operacion to authenticated;

-- Row Level Security.
alter table public.catalogo_etapas enable row level security;
alter table public.operaciones enable row level security;
alter table public.etapas_operacion enable row level security;

-- Catálogo: lectura para usuarios autenticados.
drop policy if exists "catalogo_select_authenticated" on public.catalogo_etapas;
create policy "catalogo_select_authenticated"
  on public.catalogo_etapas
  for select
  to authenticated
  using (true);

-- Operaciones: el dueño puede todo.
drop policy if exists "operaciones_select_own" on public.operaciones;
create policy "operaciones_select_own"
  on public.operaciones for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "operaciones_insert_own" on public.operaciones;
create policy "operaciones_insert_own"
  on public.operaciones for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "operaciones_update_own" on public.operaciones;
create policy "operaciones_update_own"
  on public.operaciones for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "operaciones_delete_own" on public.operaciones;
create policy "operaciones_delete_own"
  on public.operaciones for delete to authenticated
  using (auth.uid() = user_id);

-- Etapas: el dueño puede todo (user_id desnormalizado para simplificar RLS).
drop policy if exists "etapas_select_own" on public.etapas_operacion;
create policy "etapas_select_own"
  on public.etapas_operacion for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "etapas_insert_own" on public.etapas_operacion;
create policy "etapas_insert_own"
  on public.etapas_operacion for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "etapas_update_own" on public.etapas_operacion;
create policy "etapas_update_own"
  on public.etapas_operacion for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "etapas_delete_own" on public.etapas_operacion;
create policy "etapas_delete_own"
  on public.etapas_operacion for delete to authenticated
  using (auth.uid() = user_id);
