import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { planStorage } from '../utils/planStorage';
import { authService } from './authService';
import { pricing } from '../utils/pricing';
import { Plan, PlanItem } from '../types/business';
import { PLAN_TEMPLATES, PlanTemplate } from '../data/planTemplates';

export const planService = {
  getPlanTemplates(): PlanTemplate[] {
    return PLAN_TEMPLATES;
  },

  getPlanTemplateById(id: string): PlanTemplate | undefined {
    return PLAN_TEMPLATES.find(t => t.id === id || t.code === id);
  },

  async createPlanFromTemplate(templateId: string, options?: { name?: string }): Promise<Plan> {
    try {
      const template = this.getPlanTemplateById(templateId);
      if (!template) throw new Error('Template not found');

      const plan = await this.createPlan({
        name: options?.name || `${template.name} - ${new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}`,
        style: template.style,
        area_range: template.areaRange,
        budget_range: template.budgetRange,
        spaces: template.spaces,
      });

      // Add all items from template
      for (const item of template.items) {
        await this.addProductToPlan(plan.id, item, item.quantity, item.space);
      }

      // Refresh and return
      const finalPlan = await this.getPlanById(plan.id);
      if (!finalPlan) throw new Error('Failed to retrieve created plan');
      return finalPlan;
    } catch (error) {
      console.error('Plan generation failed:', error);
      throw new Error(`生成失败，请检查模板数据: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  async getPlans(): Promise<Plan[]> {
    if (isSupabaseConfigured && supabase) {
      const user = await authService.getCurrentUser();
      const anonId = authService.getAnonymousId();
      
      let query = supabase.from('plans').select('*').order('updated_at', { ascending: false });
      
      if (user) {
        query = query.or(`user_id.eq.${user.id},anonymous_id.eq.${anonId}`);
      } else {
        query = query.eq('anonymous_id', anonId);
      }
      
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    }
    return planStorage.getPlans() as unknown as Plan[];
  },

  async getPlanById(id: string): Promise<Plan | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('plans').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    }
    return planStorage.getPlanById(id) as unknown as Plan;
  },

  async getPlanItems(planId: string): Promise<PlanItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('plan_items').select('*').eq('plan_id', planId);
      if (error) return [];
      return data || [];
    }
    const plan = planStorage.getPlanById(planId);
    if (!plan || !plan.spaces) return [];
    // Convert local schema to business schema with safe calculations
    return (plan.spaces || []).flatMap(s => (s.items || []).filter(Boolean).map(i => {
      const price = Number(i.price ?? i.unitPrice ?? i.unit_price ?? 0);
      const quantity = Number(i.quantity ?? 1);
      return {
        id: i.id,
        plan_id: planId,
        product_id: (i as any).product_id || i.id,
        product_snapshot: {
          ...i,
          price: price
        },
        quantity: quantity,
        unit_price: price,
        subtotal: price * quantity,
        space: s.name
      } as unknown as PlanItem;
    }));
  },

  async createPlan(input: Partial<Plan>): Promise<Plan> {
    if (isSupabaseConfigured && supabase) {
      const user = await authService.getCurrentUser();
      const anonId = authService.getAnonymousId();
      
      const newPlan = {
        name: input.name || '我的全屋方案',
        user_id: user?.id,
        anonymous_id: anonId,
        status: 'draft',
        ...input
      };
      
      const { data, error } = await supabase.from('plans').insert(newPlan).select().single();
      if (error) throw error;
      return data;
    }
    return planStorage.createPlan(input as any) as unknown as Plan;
  },

  async deletePlan(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    planStorage.deletePlan(id);
    return true;
  },

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('plans').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    return planStorage.updatePlan(id, updates as any) as unknown as Plan;
  },

  async addTemplateMissingItemsToPlan(planId: string, templateId: string): Promise<void> {
    const template = this.getPlanTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    const currentItems = await this.getPlanItems(planId);
    
    // Simple logic: if item with same space + category/name exists, skip
    for (const tItem of template.items) {
      const exists = currentItems.some(i => 
        i.space === tItem.space && 
        (i.product_snapshot?.category === tItem.category || i.product_snapshot?.name === tItem.name)
      );

      if (!exists) {
        await this.addProductToPlan(planId, tItem, tItem.quantity, tItem.space);
      }
    }
  },

  async addProductToPlan(planId: string, product: any, quantity: number = 1, space?: string) {
    if (!product) return;
    if (isSupabaseConfigured && supabase) {
      const price = Number(
        product.price ?? 
        product.unitPrice ?? 
        product.unit_price ?? 
        product.product?.price ?? 
        product.product_snapshot?.price ?? 
        0
      );
      const qty = Number(quantity ?? product.quantity ?? 1);

      const item: Partial<PlanItem> = {
        plan_id: planId,
        product_id: product.productId || product.id,
        product_snapshot: {
          ...product,
          id: product.productId || product.id,
          name: product.name,
          category: product.category,
          price: price,
          image: product.image ?? product.product?.image ?? '',
          brand: product.brand ?? product.product?.brand ?? 'DXG Select'
        },
        quantity: qty,
        unit_price: price,
        subtotal: price * qty,
        space: space || '默认空间'
      };
      
      const { error } = await supabase.from('plan_items').insert(item);
      if (error) throw error;
      
      await this.calculatePlanTotals(planId);
      return;
    }
    planStorage.addProductToPlan(planId, product, quantity, space);
  },

  async calculatePlanTotals(planId: string) {
    if (isSupabaseConfigured && supabase) {
      const items = await this.getPlanItems(planId);
      const productTotal = items.reduce((sum, i) => sum + i.subtotal, 0);
      const serviceFee = pricing.calculateServiceFee(productTotal);
      const deliveryFee = pricing.calculateDeliveryFee(productTotal);
      const grandTotal = pricing.calculateGrandTotal(productTotal);
      
      const { error } = await supabase.from('plans').update({
        total_product_amount: productTotal,
        service_fee: serviceFee,
        delivery_fee: deliveryFee,
        grand_total: grandTotal,
        updated_at: new Date().toISOString()
      }).eq('id', planId);
      
      if (error) throw error;
    }
  }
};
