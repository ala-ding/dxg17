export type UserRole = 'user' | 'admin' | 'consultant';

export type MemberType = 'guest' | 'consumer' | 'consulting' | 'professional' | 'agent' | 'admin';

export interface UserMembership {
  id: string;
  user_id: string;
  plan_code: string;
  member_type?: MemberType;
  status: string;
  started_at?: string;
  created_at?: string;
  expired_at: string | null;
  expires_at?: string | null;
}

export type ProductStatus = 'active' | 'draft' | 'hidden' | 'discontinued';

export type PlanStatus = 'draft' | 'in_progress' | 'confirmed' | 'ordered' | 'archived';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'converted'
  | 'lost';

export type OrderStatus =
  | 'lead_submitted'
  | 'consulting'
  | 'proposal_confirmed'
  | 'deposit_pending'
  | 'deposit_paid'
  | 'procurement_pending'
  | 'procurement_started'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'unpaid'
  | 'deposit_paid'
  | 'partially_paid'
  | 'paid'
  | 'refunded';

export type ProcurementStatus =
  | 'pending'
  | 'ordered'
  | 'out_of_stock'
  | 'shipped'
  | 'delivered'
  | 'installed'
  | 'cancelled';

export type ServiceMode = 'self_service' | 'platform_standard' | 'regional_provider';

export interface Profile {
  id: string;
  name?: string;
  phone?: string;
  wechat?: string;
  city?: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  legacy_id?: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  image: string;
  images: string[];
  space: string[];
  style: string[];
  material: string[];
  ladder_level?: number;
  recommendation_reason?: string;
  description?: string;
  tagline?: string;
  usageAdvice?: string;
  budgetImpact?: {
    comparison: string;
    pressure: string;
    percentage: number;
  };
  pro_price?: number;
  agent_price?: number;
  moq?: string;
  supplier_id?: string;
  factory_price?: number;
  standard_service_price?: number;
  group_buy_level?: string;
  estimated_discount_min?: number;
  estimated_discount_max?: number;
  tier_purchase_rules?: string | any[];
  professional_note?: string;
  allow_group_buy_discount?: boolean;
  specs: Record<string, any>;
  supplier?: string;
  purchase_url?: string;
  status: ProductStatus;
  created_at: string;
}

export interface Plan {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  name: string;
  status: PlanStatus;
  style?: string;
  area_range?: string;
  budget_min?: number;
  budget_max?: number;
  budget_range?: string;
  city?: string;
  house_type?: string;
  spaces: string[];
  cover_image?: string;
  ai_summary?: string;
  ai_score?: number;
  total_product_amount: number;
  service_fee: number;
  delivery_fee: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
}

export interface PlanItem {
  id: string;
  plan_id: string;
  product_id?: string;
  product_snapshot: any;
  quantity: number;
  unit_price: number;
  subtotal: number;
  space?: string;
  note?: string;
}

export type OrderItem = PlanItem;

export interface Lead {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  plan_id?: string;
  name: string;
  phone: string;
  wechat?: string;
  city: string;
  community?: string;
  intent?: string;
  move_in_time?: string;
  budget_range?: string;
  message?: string;
  source?: string;
  status: LeadStatus;
  assigned_to?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  lead_id?: string;
  plan_id?: string;
  order_no: string;
  status: OrderStatus;
  product_amount: number;
  service_fee: number;
  delivery_fee: number;
  discount_amount: number;
  deposit_amount: number;
  paid_amount: number;
  grand_total: number;
  payment_status: PaymentStatus;
  payment_provider?: string;
  payment_intent_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address?: string;
  service_mode?: ServiceMode;
  purchase_mode?: ServiceMode;
  member_type?: MemberType;
  service_provider_id?: string;
  service_provider_name?: string;
  factory_total?: number;
  standard_service_price_total?: number;
  platform_service_fee?: number;
  regional_service_fee?: number;
  after_sales_fee?: number;
  logistics_fee_estimated_min?: number;
  logistics_fee_estimated_max?: number;
  logistics_fee_confirmed?: number;
  delivery_installation_fee?: number;
  design_service_fee?: number;
  estimated_total?: number;
  confirmed_total?: number;
  service_rate?: number;
  fulfillment_service_fee?: number;
  pricing_snapshot?: any;
  service_snapshot?: any;
  logistics_snapshot?: any;
  note?: string;
  created_at: string;
}

export interface ServicePackage {
  id: string;
  code: string;
  name: string;
  service_type: 'fulfillment' | 'after_sales' | 'logistics' | 'installation' | 'design';
  level_code: string;
  level_name: string;
  applicable_member_types: MemberType[];
  pricing_type: 'fixed' | 'percentage' | 'manual';
  fixed_price?: number;
  percentage_rate?: number;
  requires_manual_quote?: boolean;
  description: string;
  responsibility_scope?: string;
  exclusion_scope?: string;
}

export interface GroupBuyRule {
  id: string;
  name: string;
  min_order_amount: number;
  discount_rate: number;
  member_type: string;
  status: 'active' | 'inactive';
  sort_order: number;
  description?: string;
  created_at?: string;
}

export interface MembershipOrder {
  id: string;
  user_id: string;
  plan_code: string;
  amount: number;
  pay_status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  payment_method?: string;
  paid_at?: string;
  expired_at?: string;
  transaction_id?: string;
  created_at: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  city: string;
  service_rate: number;
  min_order_amount: number;
  service_tags: string[];
  rating: number;
  positive_rate: number;
  completed_order_count: number;
  response_time_label?: string;
  supports_home_visit: boolean;
  supports_installation_coordination: boolean;
  supports_design_service: boolean;
  after_sales_description?: string;
  service_description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}
