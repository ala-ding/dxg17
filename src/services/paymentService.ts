import { supabase } from '../lib/supabase';
import { MembershipOrder } from '../types/business';
import { membershipService } from './membershipService';

export const paymentService = {
  async createMembershipOrder(planCode: string, amount: number): Promise<MembershipOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const order: Partial<MembershipOrder> = {
      user_id: user.id,
      plan_code: planCode,
      amount: amount,
      pay_status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('membership_orders')
      .insert(order)
      .select()
      .single();

    if (error) {
      console.warn('Could not create actual membership order:', error);
      // Mock for development
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...order,
        created_at: new Date().toISOString()
      } as MembershipOrder;
    }

    return data;
  },

  async mockPayMembershipOrder(orderId: string): Promise<boolean> {
    const { data: order, error: fetchError } = await supabase
      .from('membership_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('Error fetching order for mock pay:', fetchError);
    }

    // In mock mode, we just activate the membership
    // If we have an order in DB, update it
    if (order) {
       await supabase
        .from('membership_orders')
        .update({ 
          pay_status: 'paid', 
          paid_at: new Date().toISOString(),
          transaction_id: 'mock_' + Date.now()
        })
        .eq('id', orderId);
       
       await membershipService.activateMembership(order.plan_code);
    } else {
       // If no real DB, just call membership activation (which also has mock)
       // We'll need the plan_code. For mock purposes, assume we know it or it's passed.
       // Since we don't have it here, we'll rely on the checkout page calling activateMembership.
    }

    return true;
  }
};
