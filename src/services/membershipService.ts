import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserMembership } from '../types/business';

export type { UserMembership };

export interface MembershipPlan {
  id: string;
  code: string;
  name: string;
  price: number;
  billing_cycle: string;
  user_type: string;
  description: string;
  status: string;
  sort_order: number;
  tier?: 'consulting' | 'professional' | 'custom' | 'free';
  period?: 'month' | 'year' | 'custom' | 'none';
  features: string[];
  is_active?: boolean;
}

export const membershipService = {
  async getMembershipPlans(): Promise<MembershipPlan[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    }
    // Mock data for local development if needed
    return [
      { id: '1', code: 'free', name: '免费用户', price: 0, billing_cycle: 'none', user_type: 'consumer', description: '适合自助了解产品和基础对比', status: 'active', sort_order: 1, tier: 'free', period: 'none', features: ['商品库自助查询', '平台标准服务价购买', '基础选购建议'], is_active: true },
      { id: '2', code: 'consulting', name: '咨询会员', price: 300, billing_cycle: 'monthly', user_type: 'consumer', description: '适合有清单、有报价、需要选购建议的用户', status: 'active', sort_order: 2, tier: 'consulting', period: 'month', features: ['1对1选购建议', '清单核对与纠错', '多方案比价分析'], is_active: true },
      { id: '3', code: 'professional', name: '专业会员', price: 1999, billing_cycle: 'yearly', user_type: 'professional', description: '适合设计师、软装公司、装修公司和专业采购用户', status: 'active', sort_order: 3, tier: 'professional', period: 'year', features: ['查看专业采购价', '厂家起订量信息', '供应商对接申请'], is_active: true },
      { id: '4', code: 'custom_service', name: '定制服务', price: 0, billing_cycle: 'custom', user_type: 'enterprise', description: '适合长期采购、项目采购、企业合作和人工协调需求', status: 'active', sort_order: 4, tier: 'custom', period: 'custom', features: ['厂家深度协调', '项目全周期跟进', '大宗采购议价'], is_active: true },
    ];
  },

  async getCurrentUserMembership(): Promise<UserMembership | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      
      // If no membership found, return a default "free" one for current user
      if (!data) {
        return {
          id: 'temp',
          user_id: user.id,
          plan_code: 'free',
          status: 'active',
          started_at: new Date().toISOString(),
          expired_at: null
        };
      }
      return data;
    }
    
    // Default for local development
    return {
      id: 'local',
      user_id: 'local-user',
      plan_code: localStorage.getItem('dxg_user_plan') || 'free',
      status: 'active',
      started_at: new Date().toISOString(),
      expired_at: null
    };
  },

  async activateMembership(planCode: string) {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      const { error } = await supabase
        .from('user_memberships')
        .upsert({
          user_id: user.id,
          plan_code: planCode,
          status: 'active',
          started_at: new Date().toISOString(),
          expired_at: planCode === 'consulting' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
            : planCode === 'professional' 
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
              : null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      if (error) throw error;
    } else {
      localStorage.setItem('dxg_user_plan', planCode);
    }
  }
};
