import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { membershipService } from './membershipService';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'product' | 'supplier' | 'service' | 'system';
}

export const permissionService = {
  async getUserPermissions() {
    const membership = await membershipService.getCurrentUserMembership();
    const planCode = membership?.plan_code || 'free';

    if (isSupabaseConfigured && supabase) {
      const { data: planPerms } = await supabase
        .from('membership_plan_permissions')
        .select('permission_code')
        .eq('plan_code', planCode)
        .eq('enabled', true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const { data: overrides } = user ? await supabase
        .from('user_permission_overrides')
        .select('*')
        .eq('user_id', user.id)
        .eq('enabled', true) : { data: [] };

      const permissions = new Set<string>();
      planPerms?.forEach(p => permissions.add(p.permission_code));
      overrides?.forEach(o => permissions.add(o.permission_code));
      
      return permissions;
    }

    // Default permissions for mock
    const perms = new Set<string>();
    if (planCode === 'free') {
      perms.add('view_basic_product_info');
      perms.add('view_standard_service_price');
      perms.add('add_to_plan');
    } else if (planCode === 'consulting') {
      perms.add('view_basic_product_info');
      perms.add('view_standard_service_price');
      perms.add('view_cost_breakdown');
      perms.add('view_alternative_recommendation');
      perms.add('add_to_plan');
    } else if (planCode === 'professional' || planCode === 'custom_service') {
      perms.add('view_basic_product_info');
      perms.add('view_standard_service_price');
      perms.add('view_cost_breakdown');
      perms.add('view_alternative_recommendation');
      perms.add('view_professional_price');
      perms.add('view_tier_price');
      perms.add('download_product_material');
      perms.add('view_supplier_basic_info');
      perms.add('add_to_plan');
    }
    return perms;
  },

  async hasPermission(permissionCode: string): Promise<boolean> {
    const perms = await this.getUserPermissions();
    return perms.has(permissionCode);
  },

  async getProductVisibility(productId: string) {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('product_visibility_rules')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle();
      return data;
    }
    return null;
  }
};
