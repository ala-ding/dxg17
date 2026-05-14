import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

export const libraryService = {
  async getLibrary(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const user = await authService.getCurrentUser();
      const anonId = authService.getAnonymousId();
      
      let query = supabase.from('product_library').select('*, products(*)').order('created_at', { ascending: false });
      
      if (user) {
        query = query.or(`user_id.eq.${user.id},anonymous_id.eq.${anonId}`);
      } else {
        query = query.eq('anonymous_id', anonId);
      }
      
      const { data, error } = await query;
      if (error) return [];
      
      // Transform to match business Product type if needed, but for now return as is
      return (data || []).map(item => ({
        ...item.products,
        library_id: item.id,
        added_at: item.created_at
      }));
    }
    
    const saved = localStorage.getItem('dxg_product_library');
    return saved ? JSON.parse(saved) : [];
  },

  async addToLibrary(productId: string) {
    if (isSupabaseConfigured && supabase) {
      const user = await authService.getCurrentUser();
      const anonId = authService.getAnonymousId();
      
      const { error } = await supabase.from('product_library').insert({
        user_id: user?.id,
        anonymous_id: anonId,
        product_id: productId
      });
      if (error) throw error;
      return true;
    }
    
    // Local storage fallback needs a product object, but here we only have ID
    // In local mode, we usually have the full object. For now just return false if mis-called
    return false;
  },

  async removeProductFromLibrary(id: string) {
    if (isSupabaseConfigured && supabase) {
      // id could be library entry id or product_id depending on how it's called
      // We'll try to delete by product_id for current user/anon
      const user = await authService.getCurrentUser();
      const anonId = authService.getAnonymousId();

      let query = supabase.from('product_library').delete().eq('product_id', id);
      if (user) {
        query = query.or(`user_id.eq.${user.id},anonymous_id.eq.${anonId}`);
      } else {
        query = query.eq('anonymous_id', anonId);
      }

      const { error } = await query;
      if (error) throw error;
      return true;
    }

    const library = JSON.parse(localStorage.getItem('dxg_product_library') || '[]');
    const newLib = library.filter((p: any) => p.id !== id);
    localStorage.setItem('dxg_product_library', JSON.stringify(newLib));
    return true;
  },
};
