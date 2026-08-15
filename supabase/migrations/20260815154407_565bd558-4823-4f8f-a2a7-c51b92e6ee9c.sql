create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users can read their own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.grant_owner_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'fayskitchen19@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_grant_admin
after insert on auth.users
for each row execute function public.grant_owner_admin();

create type public.order_status as enum ('paid','processing','fulfilled','cancelled','refunded');

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('FK-' || nextval('public.order_number_seq')::text),
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  shipping_amount integer not null default 0,
  tax_amount integer not null default 0,
  total integer not null default 0,
  currency text not null default 'usd',
  payment_status text not null default 'paid',
  status public.order_status not null default 'paid',
  shipping_address jsonb,
  environment text not null default 'live',
  notified_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_orders_created_at on public.orders (created_at desc);

grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
grant usage on sequence public.order_number_seq to service_role;
alter table public.orders enable row level security;
create policy "Admins can view orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins can update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.stripe_webhook_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);
grant all on public.stripe_webhook_events to service_role;
alter table public.stripe_webhook_events enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();