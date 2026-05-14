-- Supabase Schema for DXG Interior Design System

-- 1. Profiles Table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  wechat text,
  city text,
  role text default 'user' check (role in ('user', 'admin', 'consultant')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Products Table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  brand text,
  category text,
  price numeric default 0,
  image text,
  images jsonb default '[]'::jsonb,
  space text[] default '{}',
  style text[] default '{}',
  material text[] default '{}',
  ladder_level int,
  recommendation_reason text,
  description text,
  specs jsonb default '{}'::jsonb,
  supplier text,
  purchase_url text,
  status text default 'active' check (status in ('active','draft','hidden','discontinued')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Plans Table
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  name text not null,
  status text default 'draft' check (status in ('draft','in_progress','confirmed','ordered','archived')),
  style text,
  area_range text,
  budget_min numeric,
  budget_max numeric,
  budget_range text,
  city text,
  house_type text,
  spaces text[] default '{}',
  cover_image text,
  ai_summary text,
  ai_score int,
  total_product_amount numeric default 0,
  service_fee numeric default 0,
  delivery_fee numeric default 0,
  grand_total numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Plan Items Table
create table if not exists plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_snapshot jsonb default '{}'::jsonb,
  quantity int default 1,
  unit_price numeric default 0,
  subtotal numeric default 0,
  space text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Product Library Table
create table if not exists product_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_id text,
  product_id uuid references products(id) on delete cascade,
  product_snapshot jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 6. Leads Table
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  plan_id uuid references plans(id) on delete set null,
  name text,
  phone text,
  wechat text,
  city text,
  community text,
  intent text,
  move_in_time text,
  budget_range text,
  message text,
  source text,
  status text default 'new' check (status in ('new','contacted','qualified','proposal_sent','converted','lost')),
  assigned_to uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Orders Table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  lead_id uuid references leads(id) on delete set null,
  plan_id uuid references plans(id) on delete set null,
  order_no text unique,
  status text default 'lead_submitted' check (
    status in (
      'lead_submitted',
      'consulting',
      'proposal_confirmed',
      'deposit_pending',
      'deposit_paid',
      'procurement_pending',
      'procurement_started',
      'delivering',
      'completed',
      'cancelled'
    )
  ),
  product_amount numeric default 0,
  service_fee numeric default 0,
  delivery_fee numeric default 0,
  discount_amount numeric default 0,
  deposit_amount numeric default 0,
  paid_amount numeric default 0,
  grand_total numeric default 0,
  payment_status text default 'unpaid' check (
    payment_status in ('unpaid','deposit_paid','partially_paid','paid','refunded')
  ),
  payment_provider text,
  payment_intent_id text,
  customer_name text,
  customer_phone text,
  customer_city text,
  customer_address text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Order Items Table
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_snapshot jsonb default '{}'::jsonb,
  name text,
  brand text,
  category text,
  quantity int default 1,
  unit_price numeric default 0,
  subtotal numeric default 0,
  supplier text,
  procurement_status text default 'pending' check (
    procurement_status in ('pending','ordered','out_of_stock','shipped','delivered','installed','cancelled')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. AI Events Table
create table if not exists ai_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  plan_id uuid references plans(id) on delete set null,
  event_type text,
  input jsonb default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  model text,
  tokens int,
  cost numeric,
  created_at timestamptz default now()
);

-- 10. Analytics Events Table
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  anonymous_id text,
  event_name text not null,
  page_path text,
  entity_type text,
  entity_id text,
  properties jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 11. Admin Users Table
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'admin' check (role in ('admin','consultant')),
  created_at timestamptz default now()
);

-- RLS Enablement
alter table profiles enable row level security;
alter table products enable row level security;
alter table plans enable row level security;
alter table plan_items enable row level security;
alter table product_library enable row level security;
alter table leads enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table ai_events enable row level security;
alter table analytics_events enable row level security;
alter table admin_users enable row level security;

-- Basic Policies (Simplified for prototype/MVP)
create policy "Public readable products" on products for select using (status = 'active');
create policy "Users can read/write their own profiles" on profiles for all using (auth.uid() = id);
create policy "Users can manage their own plans" on plans for all using (auth.uid() = user_id or anonymous_id = anonymous_id);
create policy "Users can manage their own plan items" on plan_items for all using (
  exists (select 1 from plans where plans.id = plan_id and (plans.user_id = auth.uid() or plans.anonymous_id = anonymous_id))
);
