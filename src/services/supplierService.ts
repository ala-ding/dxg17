import { supabase } from '../lib/supabase';

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  reliability_score?: number;
  is_active: boolean;
  created_at?: string;
}

export const supplierService = {
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    
    if (error) {
       console.warn('Error fetching suppliers:', error);
       return [];
    }
    return data || [];
  },

  async createSupplier(supplier: Partial<Supplier>): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
