-- Planificador Inclusivo UIE
-- Métricas públicas anónimas: visitas de sesión y corazones.
-- Ejecutar en el SQL Editor de Supabase y luego configurar:
-- window.UIE_METRICS_CONFIG.supabaseUrl
-- window.UIE_METRICS_CONFIG.supabaseAnonKey

create table if not exists public.site_metrics (
    id text primary key,
    visits bigint not null default 0,
    hearts bigint not null default 0,
    updated_at timestamptz not null default now()
);

insert into public.site_metrics (id, visits, hearts)
values ('main', 0, 0)
on conflict (id) do nothing;

alter table public.site_metrics enable row level security;

drop policy if exists "Public metrics are readable" on public.site_metrics;
create policy "Public metrics are readable"
on public.site_metrics
for select
using (id = 'main');

create or replace function public.get_public_metrics()
returns table (visits bigint, hearts bigint)
language sql
security definer
set search_path = public
as $$
    select site_metrics.visits, site_metrics.hearts
    from public.site_metrics
    where site_metrics.id = 'main';
$$;

create or replace function public.increment_visit()
returns table (visits bigint, hearts bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.site_metrics
    set visits = public.site_metrics.visits + 1,
        updated_at = now()
    where public.site_metrics.id = 'main';

    return query
    select site_metrics.visits, site_metrics.hearts
    from public.site_metrics
    where site_metrics.id = 'main';
end;
$$;

create or replace function public.increment_heart()
returns table (visits bigint, hearts bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.site_metrics
    set hearts = public.site_metrics.hearts + 1,
        updated_at = now()
    where public.site_metrics.id = 'main';

    return query
    select site_metrics.visits, site_metrics.hearts
    from public.site_metrics
    where site_metrics.id = 'main';
end;
$$;

grant execute on function public.get_public_metrics() to anon;
grant execute on function public.increment_visit() to anon;
grant execute on function public.increment_heart() to anon;
