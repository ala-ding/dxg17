-- Membership Plans Table
create table if not exists membership_plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  price numeric default 0,
  billing_cycle text default 'none',
  user_type text default 'consumer',
  description text,
  status text default 'active',
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Default membership data
insert into membership_plans (code, name, price, billing_cycle, user_type, description, sort_order)
values
('free', '免费用户', 0, 'none', 'consumer', '适合自助了解产品和基础对比', 1),
('consulting', '咨询会员', 300, 'monthly', 'consumer', '适合有清单、有报价、需要选购建议的用户', 2),
('professional', '专业会员', 1999, 'yearly', 'professional', '适合设计师、软装公司、装修公司和专业采购用户', 3),
('custom_service', '定制服务', 0, 'custom', 'enterprise', '适合长期采购、项目采购、企业合作和人工协调需求', 4)
on conflict (code) do nothing;

-- User Memberships
create table if not exists user_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_code text not null,
  status text default 'active',
  started_at timestamptz default now(),
  expired_at timestamptz,
  source text,
  remark text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Permissions
create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text,
  description text,
  created_at timestamptz default now()
);

-- Membership Plan Permissions
create table if not exists membership_plan_permissions (
  id uuid primary key default gen_random_uuid(),
  plan_code text not null,
  permission_code text not null,
  enabled boolean default true,
  limit_value jsonb,
  created_at timestamptz default now(),
  unique(plan_code, permission_code)
);

-- User Permission Overrides
create table if not exists user_permission_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  permission_code text not null,
  enabled boolean default true,
  scope_type text default 'all',
  scope_id text,
  expire_at timestamptz,
  remark text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Suppliers
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  wechat text,
  address text,
  remark text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Supplier Visibility Rules
create table if not exists supplier_visibility_rules (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null,
  allow_show_name boolean default false,
  allow_show_contact boolean default false,
  allow_show_professional_price boolean default false,
  allow_show_tier_price boolean default false,
  allow_show_contract_price boolean default false,
  allow_download_material boolean default false,
  contact_mode text default 'hidden',
  require_professional_member boolean default true,
  require_manual_approval boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product Visibility Rules
create table if not exists product_visibility_rules (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  allow_show_standard_price boolean default true,
  allow_show_cost_breakdown boolean default false,
  allow_show_professional_price boolean default false,
  allow_show_tier_price boolean default false,
  allow_show_contract_price boolean default false,
  allow_show_supplier_contact boolean default false,
  allow_download_basic_list boolean default true,
  allow_download_professional_list boolean default false,
  allow_download_material boolean default false,
  allow_request_supplier_contact boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Custom Service Requests
create table if not exists custom_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  phone text not null,
  wechat text,
  city text,
  user_type text,
  service_type text,
  budget_range text,
  purchase_time text,
  description text,
  has_checklist boolean default false,
  need_supplier_coordination boolean default false,
  need_project_followup boolean default false,
  status text default 'pending',
  assignee text,
  admin_remark text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products table extensions
alter table products add column if not exists standard_service_price numeric;
alter table products add column if not exists market_reference_price numeric;
alter table products add column if not exists cost_breakdown jsonb;
alter table products add column if not exists professional_price numeric;
alter table products add column if not exists professional_price_range text;
alter table products add column if not exists tier_price jsonb;
alter table products add column if not exists contract_price numeric;
alter table products add column if not exists deep_contract_price numeric;
alter table products add column if not exists moq text;
alter table products add column if not exists lead_time text;
alter table products add column if not exists stock_status text;
alter table products add column if not exists customizable boolean default false;
alter table products add column if not exists customization_scope text;
alter table products add column if not exists mixed_batch_rule text;
alter table products add column if not exists logistics_method text;
alter table products add column if not exists after_sales_rule text;
alter table products add column if not exists supplier_id uuid;
alter table products add column if not exists material_file_url text;
