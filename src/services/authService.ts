import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ANONYMOUS_ID_KEY = 'dxg_anonymous_id';

export const authService = {
  getAnonymousId(): string {
    let id = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (!id) {
      id = `anon_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem(ANONYMOUS_ID_KEY, id);
    }
    return id;
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId: string) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  },

  async isAdmin(): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      // In local fallback mode, we allow access to admin for demo purposes
      return true;
    }
    const user = await this.getCurrentUser();
    if (!user) return false;
    
    const { data } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return !!data;
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    // Maybe clear some locals too if needed
  }
};
