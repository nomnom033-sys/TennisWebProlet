create extension if not exists btree_gist;

create table public.courts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null,
  map_url text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'planned' check (status in ('planned', 'current', 'played', 'cancelled')),
  player_name text not null,
  telegram_username text,
  phone text,
  phone_public boolean not null default false,
  cancel_token_hash text,
  source text not null default 'site',
  needs_admin_review boolean not null default false,
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'skipped')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint bookings_time_order check (end_at > start_at)
);

alter table public.bookings
  add constraint bookings_no_active_overlap
  exclude using gist (
    court_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  )
  where (status <> 'cancelled');

create table public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'cancelled', 'admin_edited', 'no_show', 'notification_failed')),
  actor text not null default 'public',
  note text,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date,
  category text not null check (category in ('appeal', 'response', 'estimate', 'scheme', 'act', 'photo', 'other')),
  court_id uuid references public.courts(id) on delete set null,
  description text,
  file_path text,
  preview_path text,
  is_public boolean not null default false,
  needs_redaction boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.maintenance_items (
  id uuid primary key default gen_random_uuid(),
  court_id uuid references public.courts(id) on delete set null,
  date date not null,
  title text not null,
  status text not null check (status in ('done', 'in_progress', 'rejected', 'planned')),
  summary text,
  source_url text,
  created_at timestamptz not null default now()
);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.courts enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;
alter table public.documents enable row level security;
alter table public.maintenance_items enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where email = auth.jwt() ->> 'email'
  );
$$;

create policy "Public can read courts" on public.courts for select using (true);
create policy "Public can read published documents" on public.documents for select using (is_public = true);
create policy "Public can read maintenance" on public.maintenance_items for select using (true);

create policy "Admins can manage courts" on public.courts for all using (public.is_admin());
create policy "Admins can manage bookings" on public.bookings for all using (public.is_admin());
create policy "Admins can read events" on public.booking_events for select using (public.is_admin());
create policy "Admins can manage documents" on public.documents for all using (public.is_admin());
create policy "Admins can manage maintenance" on public.maintenance_items for all using (public.is_admin());
create policy "Admins can read admin users" on public.admin_users for select using (public.is_admin());

insert into public.courts (slug, name, address, map_url, is_primary) values
  ('proletarsky', 'Пролетарский', 'Санкт-Петербург, у ст. м. Пролетарская, пр. Обуховской Обороны / ул. Грибакиных', 'https://yandex.ru/maps/org/tennisny_kort/191177417429', true),
  ('obukhovo', 'Обухово', 'Санкт-Петербург, 2-й Рабфаковский пер., д. 1, корп. 4', 'https://yandex.ru/maps/org/tennisny_kort/110814866174', false)
on conflict (slug) do nothing;
