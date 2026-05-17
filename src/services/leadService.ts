import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';
import { Lead } from '../types/business';

export const leadService = {
  async createLead(input: any) {
    if (isSupabaseConfigured && supabase) {
      const user = await authService.getCurrentUser();
      const anonId = authService.getAnonymousId();
      
      const { data, error } = await supabase.from('leads').insert({
        ...input,
        user_id: user?.id,
        anonymous_id: anonId,
        status: 'new'
      }).select().single();
      
      if (error) throw error;
      return data;
    }
    
    // Fallback
    const leads = JSON.parse(localStorage.getItem('dxg_leads') || '[]');
    const newLead = { 
      id: `lead_${Date.now()}`, 
      ...input, 
      status: 'new', 
      created_at: new Date().toISOString() 
    };
    leads.unshift(newLead);
    localStorage.setItem('dxg_leads', JSON.stringify(leads));
    return newLead;
  },

  async getMyLeads() {
    if (isSupabaseConfigured && supabase) {
      const user = await authService.getCurrentUser();
      const anonId = authService.getAnonymousId();
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (user) {
        query = query.or(`user_id.eq.${user.id},anonymous_id.eq.${anonId}`);
      } else {
        query = query.eq('anonymous_id', anonId);
      }
      const { data } = await query;
      return data || [];
    }
    return JSON.parse(localStorage.getItem('dxg_leads') || '[]');
  },

  async deleteLead(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    } else {
      const leads = JSON.parse(localStorage.getItem('dxg_leads') || '[]');
      const filtered = leads.filter((l: any) => l.id !== id);
      localStorage.setItem('dxg_leads', JSON.stringify(filtered));
    }
  }
};
