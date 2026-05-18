import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_PRODUCTS_LIST as MOCK_PRODUCTS } from '../data/products';
import { Product } from '../types/business';

export const productService = {
  async getProducts(filters?: {
    category?: string;
    space?: string;
    style?: string;
    tier?: string;
    search?: string;
    level?: number;
  }): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('products').select('*').eq('status', 'active');

      if (filters?.category && filters.category !== '全部') {
        query = query.eq('category', filters.category);
      }
      if (filters?.space && filters.space !== '全部') {
        query = query.contains('space', [filters.space]);
      }
      if (filters?.style && filters.style !== '全部') {
        query = query.contains('style', [filters.style]);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
      }
      if (filters?.level) {
        query = query.eq('ladder_level', filters.level);
      }
      
      // Tier to ladder_level mapping logic if needed
      if (filters?.tier && filters.tier !== '全部') {
         // Updated mapping for 10-level budget ladder (2 levels per series)
         const tierMap: Record<string, [number, number]> = {
           'F': [1, 2],
           'M': [3, 4],
           'P': [5, 6],
           'S': [7, 8],
           'X': [9, 10]
         };
         
         const range = tierMap[filters.tier];
         if (range) {
           query = query.gte('ladder_level', range[0]).lte('ladder_level', range[1]);
         } else if (!isNaN(Number(filters.tier))) {
           query = query.eq('ladder_level', Number(filters.tier));
         }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Fetch products error:', error);
        return this.getFallbackProducts(filters);
      }
      return data || [];
    }

    return this.getFallbackProducts(filters);
  },

  getFallbackProducts(filters?: any): Product[] {
    const localData = localStorage.getItem('dxg_admin_products');
    let products: Product[] = [];
    
    if (localData) {
      try {
        products = JSON.parse(localData);
      } catch (e) {
        console.error('Local data parse error', e);
      }
    }
    
    if (products.length === 0) {
      products = MOCK_PRODUCTS.map(p => ({
        ...p,
        factory_price: p.price, // Base factory price
        standard_service_price: Math.round(p.price * 1.2), // Standard platform price (20% up)
        status: 'active' as any,
        created_at: new Date().toISOString(),
        specs: {},
        images: [p.image]
      })) as unknown as Product[];
      this.saveLocalProducts(products);
    }

    let filtered = [...products];

    if (filters?.category && filters.category !== '全部') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters?.tier && filters.tier !== '全部') {
      const tierMap: Record<string, [number, number]> = {
        'F': [1, 2],
        'M': [3, 4],
        'P': [5, 6],
        'S': [7, 8],
        'X': [9, 10]
      };
      
      const range = tierMap[filters.tier];
      if (range) {
        filtered = filtered.filter(p => (p.ladder_level || 0) >= range[0] && (p.ladder_level || 0) <= range[1]);
      } else if (!isNaN(Number(filters.tier))) {
        filtered = filtered.filter(p => (p.ladder_level || 0) === Number(filters.tier));
      }
    }
    
    if (filters?.style && filters.style !== '全部') {
      filtered = filtered.filter(p => p.style?.includes(filters.style));
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || (p.brand || '').toLowerCase().includes(s));
    }

    return filtered;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').insert(product).select().single();
      if (error) throw error;
      return data;
    }
    
    const newProduct = { 
      ...product, 
      id: product.id || `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: product.status || 'active'
    } as Product;
    
    const products = this.getFallbackProducts();
    this.saveLocalProducts([newProduct, ...products]);
    
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    
    const products = this.getFallbackProducts();
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    this.saveLocalProducts(updated);
    
    return updated.find(p => p.id === id) || { ...updates, id } as Product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    
    const products = this.getFallbackProducts();
    this.saveLocalProducts(products.filter(p => p.id !== id));
    return true;
  },

  saveLocalProducts(products: Product[]) {
    localStorage.setItem('dxg_admin_products', JSON.stringify(products));
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) return data;
    }
    const mock = MOCK_PRODUCTS.find(p => p.id === id || (p as any).legacy_id === id);
    if (mock) return { ...mock, status: 'active', created_at: new Date().toISOString(), specs: {}, images: [mock.image] } as unknown as Product;
    return null;
  },

  async syncMockProductsToSupabase() {
    if (!isSupabaseConfigured || !supabase) return { success: false, message: 'Supabase not configured' };

    const productsToInsert = MOCK_PRODUCTS.map(p => ({
      legacy_id: p.id,
      name: p.name,
      brand: (p as any).brand || 'DXG',
      category: p.category,
      price: p.price,
      factory_price: p.price,
      standard_service_price: Math.round(p.price * 1.2),
      image: p.image,
      space: (p as any).space ? [(p as any).space] : [],
      style: (p as any).style ? [(p as any).style] : [],
      ladder_level: (p as any).level || 5,
      status: 'active'
    }));

    const { error } = await supabase.from('products').upsert(productsToInsert, { onConflict: 'legacy_id' });
    if (error) throw error;
    return { success: true };
  }
};
