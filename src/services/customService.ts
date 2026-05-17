import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CustomServiceRequest {
  id?: string;
  user_id?: string;
  name: string;
  phone: string;
  wechat?: string;
  city?: string;
  user_type: string;
  service_type: string;
  budget_range?: string;
  purchase_time?: string;
  description: string;
  has_checklist?: boolean;
  need_supplier_coordination?: boolean;
  need_project_followup?: boolean;
  status?: string;
  created_at?: string;
}

export const customService = {
  async createCustomServiceRequest(data: CustomServiceRequest) {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('custom_service_requests')
        .insert({
          ...data,
          user_id: user?.id
        });
      if (error) throw error;
    } else {
      console.log('Mock: Custom service request submitted', data);
      const requests = JSON.parse(localStorage.getItem('dxg_custom_requests') || '[]');
      requests.push({ ...data, id: Date.now().toString(), created_at: new Date().toISOString() });
      localStorage.setItem('dxg_custom_requests', JSON.stringify(requests));
    }
  },

  async getCustomServiceRequests() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('custom_service_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return JSON.parse(localStorage.getItem('dxg_custom_requests') || '[]');
  }
};
