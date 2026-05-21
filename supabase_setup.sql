-- ============================================================
-- EPIra - Script único de banco (Supabase / PostgreSQL)
-- Cole no SQL Editor e clique em Run
-- ============================================================

-- ------------------------------------------------------------
-- 1) TABELAS
-- ------------------------------------------------------------

-- Perfis (1:1 com auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  nome        text,
  cargo       text,
  cpf         text,
  created_at  timestamptz not null default now()
);

-- EPIs cadastrados
create table if not exists public.epis (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  categoria   text,
  ca          text,
  validade    date,
  quantidade  integer not null default 0 check (quantidade >= 0),
  obs         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Movimentações / entregas
create table if not exists public.movimentacoes (
  id           uuid primary key default gen_random_uuid(),
  epi_id       uuid not null references public.epis(id) on delete cascade,
  tipo         text not null check (tipo in ('entrada', 'saida', 'entrega')),
  quantidade   integer not null check (quantidade > 0),
  colaborador  text,
  data         date not null default current_date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_movimentacoes_epi_id
  on public.movimentacoes(epi_id);

-- ------------------------------------------------------------
-- 2) ROW LEVEL SECURITY + POLÍTICAS
-- ------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.epis          enable row level security;
alter table public.movimentacoes enable row level security;

-- Profiles
drop policy if exists "profiles_select"     on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- EPIs
drop policy if exists "epis_select" on public.epis;
drop policy if exists "epis_insert" on public.epis;
drop policy if exists "epis_update" on public.epis;
drop policy if exists "epis_delete" on public.epis;
create policy "epis_select" on public.epis for select to authenticated using (true);
create policy "epis_insert" on public.epis for insert to authenticated with check (true);
create policy "epis_update" on public.epis for update to authenticated using (true);
create policy "epis_delete" on public.epis for delete to authenticated using (true);

-- Movimentações
drop policy if exists "mov_select" on public.movimentacoes;
drop policy if exists "mov_insert" on public.movimentacoes;
drop policy if exists "mov_update" on public.movimentacoes;
drop policy if exists "mov_delete" on public.movimentacoes;
create policy "mov_select" on public.movimentacoes for select to authenticated using (true);
create policy "mov_insert" on public.movimentacoes for insert to authenticated with check (true);
create policy "mov_update" on public.movimentacoes for update to authenticated using (true);
create policy "mov_delete" on public.movimentacoes for delete to authenticated using (true);

-- ------------------------------------------------------------
-- 3) TRIGGER: criar perfil ao cadastrar usuário
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 4) TRIGGER: updated_at automático
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_epis_updated_at on public.epis;
create trigger trg_epis_updated_at
  before update on public.epis
  for each row execute function public.set_updated_at();

drop trigger if exists trg_mov_updated_at on public.movimentacoes;
create trigger trg_mov_updated_at
  before update on public.movimentacoes
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 5) TRIGGER: aplicar movimentação no estoque
--    'entrada' soma | 'saida'/'entrega' subtraem
--    DELETE reverte o efeito
-- ------------------------------------------------------------
create or replace function public.aplicar_movimentacao()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    if new.tipo = 'entrada' then
      update public.epis set quantidade = quantidade + new.quantidade where id = new.epi_id;
    else
      update public.epis set quantidade = quantidade - new.quantidade where id = new.epi_id;
    end if;
    return new;

  elsif (tg_op = 'DELETE') then
    if old.tipo = 'entrada' then
      update public.epis set quantidade = quantidade - old.quantidade where id = old.epi_id;
    else
      update public.epis set quantidade = quantidade + old.quantidade where id = old.epi_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_mov_estoque on public.movimentacoes;
create trigger trg_mov_estoque
  after insert or delete on public.movimentacoes
  for each row execute function public.aplicar_movimentacao();
