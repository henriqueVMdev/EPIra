-- ============================================================
-- EPIra - Triggers e funcoes (rodar DEPOIS de supabase_schema.sql)
-- Cole no Supabase: SQL Editor > New query > Run
-- ============================================================

-- ============================================================
-- 1) TABELA DE PERFIS + TRIGGER ao criar usuario
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  nome        text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Funcao: cria um perfil sempre que um usuario se cadastra
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

-- ============================================================
-- 2) TRIGGER de updated_at (preenche a data sozinho ao editar)
-- ============================================================
alter table public.epis
  add column if not exists updated_at timestamptz not null default now();
alter table public.movimentacoes
  add column if not exists updated_at timestamptz not null default now();

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

-- ============================================================
-- 3) TRIGGER de estoque (atualiza epis.quantidade automaticamente)
-- ============================================================
-- 'entrada' soma ao estoque; 'saida'/'entrega' subtraem.
-- Ao apagar uma movimentacao, o efeito e revertido.
create or replace function public.aplicar_movimentacao()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    if new.tipo = 'entrada' then
      update public.epis
        set quantidade = quantidade + new.quantidade
        where id = new.epi_id;
    else
      update public.epis
        set quantidade = quantidade - new.quantidade
        where id = new.epi_id;
    end if;
    return new;

  elsif (tg_op = 'DELETE') then
    if old.tipo = 'entrada' then
      update public.epis
        set quantidade = quantidade - old.quantidade
        where id = old.epi_id;
    else
      update public.epis
        set quantidade = quantidade + old.quantidade
        where id = old.epi_id;
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
