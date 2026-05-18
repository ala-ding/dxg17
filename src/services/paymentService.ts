import { supabase } from '../lib/supabase';
import { MembershipOrder } from '../types/business';
import { membershipService } from './membershipService';
import { orderService } from './orderService';

export const paymentService = {
  async createMembershipOrder(planCode: string, amount: number): Promise<MembershipOrder> {
    return orderService.createCommercialOrder({
      type: 'membership',
      title: `${planCode === 'professional' ? '专业' : '咨询'}会员开通`,
      amount,
      membershipPlanCode: planCode
    }) as any;
  },

  async mockPayMembershipOrder(orderId: string): Promise<boolean> {
    return orderService.payOrder(orderId);
  },

  async createPlanUnlockOrder(planId: string, tier: 'basic' | 'professional', amount: number) {
    return orderService.createCommercialOrder({
      type: 'plan_list_unlock',
      title: `解锁方案清单 - ${tier === 'professional' ? '专业版' : '基础版'}`,
      amount,
      planId
    });
  }
};
