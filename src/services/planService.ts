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

      // Cleanup any potential duplicates added during creation (though addProductToPlan should handle it)
      await this.cleanupDuplicateItems(plan.id);

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
    const productId = product.productId || product.id || (product.product_snapshot && product.product_snapshot.id);
    
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

      // Check if product already exists in this plan
      const { data: existingItems } = await supabase
        .from('plan_items')
        .select('*')
        .eq('plan_id', planId)
        .eq('product_id', productId);

      if (existingItems && existingItems.length > 0) {
        // Update existing item
        const existing = existingItems[0];
        const newQty = (existing.quantity || 0) + qty;
        const { error } = await supabase
          .from('plan_items')
          .update({ 
            quantity: newQty, 
            subtotal: price * newQty,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        if (error) throw error;
        
        // If there were multiple duplicates, cleanup the rest
        if (existingItems.length > 1) {
          await this.cleanupDuplicateItems(planId);
        }
      } else {
        // Insert new item
        const item: Partial<PlanItem> = {
          plan_id: planId,
          product_id: productId,
          product_snapshot: {
            ...product,
            id: productId,
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
      }
      
      await this.calculatePlanTotals(planId);
      return;
    }
    planStorage.addProductToPlan(planId, product, quantity, space);
  },

  async cleanupDuplicateItems(planId: string) {
    if (isSupabaseConfigured && supabase) {
      const { data: items } = await supabase.from('plan_items').select('*').eq('plan_id', planId);
      if (!items) return;

      const groups = new Map<string, any[]>();
      items.forEach(item => {
        const key = item.product_id;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(item);
      });

      for (const [productId, dupes] of groups.entries()) {
        if (dupes.length > 1) {
          const totalQty = dupes.reduce((sum, d) => sum + (d.quantity || 1), 0);
          const first = dupes[0];
          const price = first.unit_price || first.price || 0;

          // Update first one with total quantity
          await supabase.from('plan_items').update({
            quantity: totalQty,
            subtotal: price * totalQty
          }).eq('id', first.id);

          // Delete others
          const idsToDelete = dupes.slice(1).map(d => d.id);
          await supabase.from('plan_items').delete().in('id', idsToDelete);
        }
      }
    } else {
      // Local storage cleanup
      const plans = planStorage.getPlans();
      const updatedPlans = plans.map(p => {
        if (p.id === planId) {
          const allItems: any[] = [];
          p.spaces.forEach(s => {
            if (s.items) allItems.push(...s.items.filter(Boolean));
          });

          const groups = new Map<string, any[]>();
          allItems.forEach((it: any) => {
            const pid = it.product_id || it.productId || it.id;
            if (!groups.has(pid)) groups.set(pid, []);
            groups.get(pid)!.push(it);
          });

          // Re-evaluate spaces assuming we keep products in their first added space
          const newSpaces = p.spaces.map(s => ({ ...s, items: [] as any[] }));
          
          groups.forEach((dupes, pid) => {
            const first = dupes[0];
            // Safe merging: use unique items by ID if possible, otherwise sum up
            const uniqueById = new Map<string, any>();
            dupes.forEach(d => {
              if (d.id) uniqueById.set(d.id, d);
              else uniqueById.set(`temp_${Math.random()}`, d);
            });
            
            const itemsToSum = Array.from(uniqueById.values());
            const totalQty = itemsToSum.reduce((sum, d) => sum + (Number(d.quantity) || 1), 0);
            const price = Number(first.price || first.unitPrice || first.unit_price || 0);
            
            const mergedItem = {
              ...first,
              quantity: totalQty,
              subtotal: price * totalQty
            };

            // Fix the space allocation logic
            const targetSpaceName = first.space || (p.spaces && p.spaces[0] && p.spaces[0].name) || "默认空间";
            const spaceIdx = newSpaces.findIndex(ns => ns.name === targetSpaceName);
            const finalSpaceIdx = spaceIdx === -1 ? 0 : spaceIdx;
            newSpaces[finalSpaceIdx].items.push(mergedItem);
          });

          return { ...p, spaces: newSpaces };
        }
        return p;
      });
      planStorage.savePlans(updatedPlans);
    }
    await this.calculatePlanTotals(planId);
  },

  async removeProductFromPlan(planId: string, productId: string) {
    if (isSupabaseConfigured && supabase) {
      // For Supabase, the productId in plan_items is the primary key of that specific record in the relationship
      // but in local storage we use the product id.
      // We need to be careful. In PlanDetailView, item.id is passed.
      const { error } = await supabase.from('plan_items').delete().eq('id', productId);
      if (error) throw error;
      
      await this.calculatePlanTotals(planId);
      return;
    }
    planStorage.removeProductFromPlan(planId, productId);
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
