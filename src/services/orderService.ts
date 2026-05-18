import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';
import { planService } from './planService';
import { leadService } from './leadService';
import { membershipService } from './membershipService';
import { Order, OrderItem, OrderType } from '../types/business';

export const orderService = {
  async createOrderFromPlan(planId: string, leadInput: any) {
    // 1. Get Plan and Items
    const plan = await planService.getPlanById(planId);
    const items = await planService.getPlanItems(planId);
    if (!plan || items.length === 0) throw new Error('Plan is empty or not found');

    // 2. Create Lead
    const lead = await leadService.createLead({
      ...leadInput,
      plan_id: planId,
      intent: leadInput.intent || 'purchase'
    });

    const user = await authService.getCurrentUser();
    const anonId = authService.getAnonymousId();
    const orderNo = `DXG${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100000 + Math.random() * 900000)}`;

    if (isSupabaseConfigured && supabase) {
      // 3. Create Order
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: user?.id,
        anonymous_id: anonId,
        lead_id: lead.id,
        plan_id: planId,
        order_no: orderNo,
        status: 'lead_submitted',
        product_amount: plan.total_product_amount,
        service_fee: plan.service_fee,
        delivery_fee: plan.delivery_fee,
        grand_total: plan.grand_total,
        customer_name: leadInput.name,
        customer_phone: leadInput.phone,
        customer_city: leadInput.city,
        payment_status: 'unpaid'
      }).select().single();

      if (orderError) throw orderError;

      // 4. Create Order Items
      const orderItems = items.map(i => ({
        order_id: order.id,
        product_id: i.product_id,
        product_snapshot: i.product_snapshot,
        name: i.product_snapshot?.name,
        brand: i.product_snapshot?.brand || 'DXG',
        category: i.product_snapshot?.category,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal,
        procurement_status: 'pending'
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 5. Update Plan Status
      await supabase.from('plans').update({ status: 'confirmed' }).eq('id', planId);

      return order;
    }

    // Fallback
    const orders = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
    const allOrderItems = JSON.parse(localStorage.getItem('dxg_order_items') || '[]');

    const newOrder = {
      id: `order_${Date.now()}`,
      order_no: orderNo,
      status: 'lead_submitted',
      product_amount: (plan as any).budget?.furnitureTotal || 0,
      service_fee: (plan as any).budget?.furnitureTotal ? (plan as any).budget.furnitureTotal * 0.05 : 0,
      delivery_fee: 1500,
      grand_total: 0, // Should calculate
      customer_name: leadInput.name,
      customer_phone: leadInput.phone,
      payment_status: 'unpaid',
      created_at: new Date().toISOString()
    };
    
    // Add items... simplify for mock
    orders.unshift(newOrder);
    localStorage.setItem('dxg_orders', JSON.stringify(orders));
    return newOrder;
  },

  async createCommercialOrder(params: {
    type: OrderType;
    title: string;
    amount: number;
    planId?: string;
    membershipPlanCode?: string;
    paymentMethod?: string;
  }) {
    const user = await authService.getCurrentUser();
    const orderNo = `ORDER${Date.now()}`;
    
    const newOrder: Partial<Order> = {
      order_no: orderNo,
      type: params.type,
      title: params.title,
      amount: params.amount,
      currency: 'CNY',
      status: 'pending',
      payment_status: 'unpaid',
      payment_method: params.paymentMethod || 'mock',
      user_id: user?.id || 'guest',
      customer_name: user?.user_metadata?.name || user?.email || '访客屋主',
      plan_id: params.planId,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
      if (error) throw error;
      return data;
    }

    const orders = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
    const finalOrder = { ...newOrder, id: `order_${Date.now()}` };
    orders.unshift(finalOrder);
    localStorage.setItem('dxg_orders', JSON.stringify(orders));
    return finalOrder;
  },

  async payOrder(orderId: string) {
    const user = await authService.getCurrentUser();
    
    if (isSupabaseConfigured && supabase) {
      const { data: order, error: fetchError } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase.from('orders').update({
        status: 'paid',
        payment_status: 'paid',
        paid_at: new Date().toISOString()
      }).eq('id', orderId);
      if (updateError) throw updateError;

      // Side effects
      if (order.type === 'membership') {
        const planCode = order.title.includes('专业') ? 'professional' : 'consulting';
        await membershipService.activateMembership(planCode);
      } else if (order.type === 'plan_list_unlock') {
        // Mark plan as unlocked in separate table or JSON field
        if (order.plan_id) {
          const unlockType = order.title.includes('专业') ? 'professional' : 'basic';
          await supabase.from('plans').update({
            unlock_status: {
              unlocked: true,
              type: unlockType,
              unlocked_at: new Date().toISOString(),
              order_id: orderId
            }
          }).eq('id', order.plan_id);
        }
      }
      return true;
    }

    const orders = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'paid';
    order.payment_status = 'paid';
    order.paid_at = new Date().toISOString();

    localStorage.setItem('dxg_orders', JSON.stringify(orders));

    // Local side effects
    if (order.type === 'membership') {
      const planCode = order.title.includes('专业') ? 'professional' : 'consulting';
      localStorage.setItem('dxg_user_plan', planCode);
    } else if (order.type === 'plan_list_unlock') {
      if (order.plan_id) {
        const unlocks = JSON.parse(localStorage.getItem('dxg_plan_unlocks') || '{}');
        const unlockType = order.title.includes('专业') ? 'professional' : 'basic';
        unlocks[order.plan_id] = {
          unlocked: true,
          type: unlockType,
          unlocked_at: new Date().toISOString(),
          order_id: orderId
        };
        localStorage.setItem('dxg_plan_unlocks', JSON.stringify(unlocks));
      }
    }

    return true;
  },

  async getAllOrders() {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return data || [];
    }
    return JSON.parse(localStorage.getItem('dxg_orders') || '[]');
  },

  async getMyOrders() {
    if (isSupabaseConfigured && supabase) {
      const user = await authService.getCurrentUser();
      const anonId = authService.getAnonymousId();
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (user) {
        query = query.or(`user_id.eq.${user.id},anonymous_id.eq.${anonId}`);
      } else {
        query = query.eq('anonymous_id', anonId);
      }
      const { data } = await query;
      return data || [];
    }
    return JSON.parse(localStorage.getItem('dxg_orders') || '[]');
  },

  async getOrderById(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
      return { ...order, items };
    }
    const orders = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
    const order = orders.find((o: any) => o.id === id);
    return order ? { ...order, items: [] } : null;
  },

  async simulateDepositPaid(orderId: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').update({
        status: 'deposit_paid',
        payment_status: 'deposit_paid',
        deposit_amount: 1000,
        paid_amount: 1000,
        updated_at: new Date().toISOString()
      }).eq('id', orderId);
      if (error) throw error;
      return true;
    }
    
    const orders = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
    const updated = orders.map((o: any) => o.id === orderId ? { ...o, status: 'deposit_paid', payment_status: 'deposit_paid' } : o);
    localStorage.setItem('dxg_orders', JSON.stringify(updated));
    return true;
  }
};
