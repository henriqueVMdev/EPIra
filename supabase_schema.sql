-- ============================================================
-- EPIra - Esquema do banco de dados (Supabase / PostgreSQL)
-- Cole este conteúdo no Supabase: SQL Editor > New query > Run
-- ============================================================

-- Tabela de EPIs cadastrados
create table if not exists public.epis (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  categoria   text,
  ca          text,
  validade    date,
  quantidade  integer not null default 0 check (quantidade >= 0),
  obs         text,
  created_at  timestamptz not null default now()
);

-- Tabela de movimentações / entregas de EPI
create table if not exists public.movimentacoes (
  id           uuid primary key default gen_random_uuid(),
  epi_id       uuid not null references public.epis(id) on delete cascade,
  tipo         text not null check (tipo in ('entrada', 'saida', 'entrega')),
  quantidade   integer not null check (quantidade > 0),
  colaborador  text,
  data         date not null default current_date,
  created_at   timestamptz not null default now()
);

create index if not exists idx_movimentacoes_epi_id on public.movimentacoes(epi_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.epis enable row level security;
alter table public.movimentacoes enable row level security;

-- Permite acesso a usuarios autenticados.
-- (Para testes rapidos sem login, troque 'authenticated' por 'anon, authenticated'.)
create policy "epis_select" on public.epis
  for select to authenticated using (true);
create policy "epis_insert" on public.epis
  for insert to authenticated with check (true);
create policy "epis_update" on public.epis
  for update to authenticated using (true);
create policy "epis_delete" on public.epis
  for delete to authenticated using (true);

create policy "mov_select" on public.movimentacoes
  for select to authenticated using (true);
create policy "mov_insert" on public.movimentacoes
  for insert to authenticated with check (true);
create policy "mov_update" on public.movimentacoes
  for update to authenticated using (true);
create policy "mov_delete" on public.movimentacoes
  for delete to authenticated using (true);
