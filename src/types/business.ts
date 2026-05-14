export type UserRole = 'user' | 'admin' | 'consultant';

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
  note?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_snapshot: any;
  name: string;
  brand?: string;
  category?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  supplier?: string;
  procurement_status: ProcurementStatus;
}
