import { supabase } from '../lib/supabase';
import { GroupBuyRule } from '../types/business';

export const groupBuyRuleService = {
  async getRules(): Promise<GroupBuyRule[]> {
    const { data, error } = await supabase
      .from('group_buy_discount_rules')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.warn('Error fetching group buy rules:', error);
      // Return default rules if table doesn't exist or error occurs
      return [
        { id: '1', name: '基础集采档', min_order_amount: 0, discount_rate: 3, member_type: 'professional', status: 'active', sort_order: 1, description: '专业会员基础集采优惠' },
        { id: '2', name: '满2万档', min_order_amount: 20000, discount_rate: 5, member_type: 'professional', status: 'active', sort_order: 2, description: '方案采购满2万元' },
        { id: '3', name: '满5万档', min_order_amount: 50000, discount_rate: 8, member_type: 'professional', status: 'active', sort_order: 3, description: '方案采购满5万元' },
        { id: '4', name: '满10万档', min_order_amount: 100000, discount_rate: 12, member_type: 'professional', status: 'active', sort_order: 4, description: '方案采购满10万元' },
        { id: '5', name: '满30万项目档', min_order_amount: 300000, discount_rate: 15, member_type: 'professional', status: 'active', sort_order: 5, description: '大额项目采购，需平台确认' },
      ];
    }
    return data || [];
  },

  async updateRule(id: string, rule: Partial<GroupBuyRule>): Promise<void> {
    const { error } = await supabase
      .from('group_buy_discount_rules')
      .update(rule)
      .eq('id', id);
    if (error) throw error;
  },

  async createRule(rule: Partial<GroupBuyRule>): Promise<void> {
    const { error } = await supabase
      .from('group_buy_discount_rules')
      .insert(rule);
    if (error) throw error;
  }
};
