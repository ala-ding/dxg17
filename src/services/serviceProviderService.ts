import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ServiceProvider } from '../types/business';

export const serviceProviderService = {
  async getServiceProviders(filters?: { city?: string; status?: string }): Promise<ServiceProvider[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('service_providers').select('*');
      
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query.order('rating', { ascending: false });
      if (error) {
        console.error('Fetch service providers error:', error);
        return [];
      }
      return data || [];
    }

    return MOCK_PROVIDERS;
  },

  async getServiceProviderById(id: string): Promise<ServiceProvider | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('service_providers').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    }
    return MOCK_PROVIDERS.find(p => p.id === id) || null;
  },

  async createServiceProvider(provider: Partial<ServiceProvider>): Promise<ServiceProvider> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('service_providers').insert(provider).select().single();
      if (error) throw error;
      return data;
    }
    return { ...provider, id: `local-${Date.now()}` } as ServiceProvider;
  },

  async updateServiceProvider(id: string, updates: Partial<ServiceProvider>): Promise<ServiceProvider> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('service_providers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    return { ...updates, id } as ServiceProvider;
  },

  async deleteServiceProvider(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('service_providers').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    return true;
  }
};

const MOCK_PROVIDERS: ServiceProvider[] = [
  {
    id: 'sp1',
    name: '杭州壹舍家居服务',
    city: '杭州',
    service_rate: 28,
    min_order_amount: 10000,
    service_tags: ['响应快', '可上门', '安装协调', '售后细致'],
    rating: 4.9,
    positive_rate: 98,
    completed_order_count: 128,
    response_time_label: '1小时内',
    supports_home_visit: true,
    supports_installation_coordination: true,
    supports_design_service: true,
    after_sales_description: '专属管家1对1，24小时响应，终身维保协助',
    service_description: '深耕杭州本地市场，提供从测量、方案优化到落地交付的一站式服务。',
    status: 'active'
  },
  {
    id: 'sp2',
    name: '上海精准交付中心',
    city: '上海',
    service_rate: 35,
    min_order_amount: 50000,
    service_tags: ['高标准', '大平层经验', '工厂对接'],
    rating: 4.8,
    positive_rate: 95,
    completed_order_count: 86,
    response_time_label: '2小时内',
    supports_home_visit: true,
    supports_installation_coordination: true,
    supports_design_service: false,
    after_sales_description: '3年质保，季度主动回访',
    service_description: '专注于高端住宅项目的柔性交付与多晶协同。',
    status: 'active'
  }
];
