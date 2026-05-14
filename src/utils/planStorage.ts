import { UserPlan, PlanProduct } from '../types';
import { pricing } from './pricing';

const USER_PLANS_KEY = 'dxg_user_plans';
const CURRENT_PLAN_ID_KEY = 'dxg_current_plan_id';
const PRODUCT_LIBRARY_KEY = 'dxg_product_library';

/**
 * Business Types for storage (to avoid confusion with display types if needed)
 * But we'll try to stick to types.ts as much as possible.
 * We'll extend/normalize them here.
 */

export const calculatePlanCompleteness = (plan: Partial<UserPlan>): number => {
  let score = 0;
  
  // 方案名称 10%
  if (plan.name && plan.name.trim().length > 0 && !plan.name.includes('未命名')) score += 10;
  
  // 方案风格 15%
  if (plan.preferredStyle || plan.style) score += 15;
  
  // 预计面积 15%
  if (plan.areaRange || (plan as any).area_range) score += 15;
  
  // 户型 / 家庭人数 15% (7.5% each)
  if (plan.houseType || (plan as any).house_type) score += 7.5;
  if (plan.familySize || (plan as any).family_size) score += 7.5;
  
  // 预算档位 20%
  if (plan.budgetLimit || plan.budget?.range || (plan as any).budget_range) score += 20;
  
  // 需要配置的空间 15%
  if (plan.spaces && plan.spaces.length > 0) score += 15;
  
  // 重点关注 5%
  if (plan.priorities && plan.priorities.trim().length > 0) score += 5;
  
  // 居住需求 / 备注 5% (2.5% each)
  if (plan.livingNeeds || (plan as any).living_needs) score += 2.5;
  if (plan.notes || (plan as any).note) score += 2.5;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const planStorage = {
  // --- Plans Management ---
  
  getPlans(): UserPlan[] {
    const saved = localStorage.getItem(USER_PLANS_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse plans', e);
      return [];
    }
  },

  savePlans(plans: UserPlan[]): void {
    localStorage.setItem(USER_PLANS_KEY, JSON.stringify(plans));
  },

  getPlanById(id: string): UserPlan | undefined {
    return this.getPlans().find(p => p.id === id);
  },

  getCurrentPlanId(): string | null {
    return localStorage.getItem(CURRENT_PLAN_ID_KEY);
  },

  setCurrentPlanId(id: string | null): void {
    if (id) {
      localStorage.setItem(CURRENT_PLAN_ID_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_PLAN_ID_KEY);
    }
  },

  createPlan(input?: Partial<UserPlan>): UserPlan {
    const plans = this.getPlans();
    const newPlan: UserPlan = {
      id: `plan_${Date.now()}`,
      name: input?.name || '我的全屋方案',
      type: input?.type || 'manual',
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      completion: 0,
      matchProfile: input?.matchProfile || {
        spaces: [],
        styleFeelings: [],
      },
      spaces: input?.spaces || [
        { id: 's_kj', name: '客厅', budget: 0, items: [], note: '' },
        { id: 's_ws', name: '主卧', budget: 0, items: [], note: '' }
      ],
      budget: input?.budget || {
        range: '待定',
        estimatedTotal: 0,
      },
      ...input
    };
    
    newPlan.completion = calculatePlanCompleteness(newPlan);

    const updatedPlans = [newPlan, ...plans];
    this.savePlans(updatedPlans);
    this.setCurrentPlanId(newPlan.id);
    return newPlan;
  },

  updatePlan(planId: string, patch: Partial<UserPlan>): UserPlan {
    const plans = this.getPlans();
    let updatedPlan: UserPlan | null = null;
    const updatedPlans = plans.map(p => {
      if (p.id === planId) {
        const merged = { ...p, ...patch, updatedAt: new Date().toISOString().split('T')[0] };
        merged.completion = calculatePlanCompleteness(merged);
        updatedPlan = merged;
        return updatedPlan;
      }
      return p;
    });
    this.savePlans(updatedPlans);
    return updatedPlan!;
  },

  deletePlan(planId: string): void {
    const plans = this.getPlans();
    const updatedPlans = plans.filter(p => p.id !== planId);
    this.savePlans(updatedPlans);
    if (this.getCurrentPlanId() === planId) {
      this.setCurrentPlanId(null);
    }
  },

  // --- Products in Plans ---

  addProductToPlan(planId: string, product: any, quantity: number = 1, spaceName?: string): void {
    if (!product) return;
    const plans = this.getPlans();
    const updatedPlans = plans.map(p => {
      if (p.id === planId) {
        // Find target space by name or default to first
        let targetSpace = p.spaces[0];
        if (spaceName) {
          const found = p.spaces.find(s => s.name === spaceName);
          if (found) {
            targetSpace = found;
          } else {
            // Create new space if not found
            targetSpace = { id: `s_${Date.now()}`, name: spaceName, budget: 0, items: [], note: '' };
            p.spaces.push(targetSpace);
          }
        }
        
        const updatedSpaces = p.spaces.map(s => {
          if (s.id === targetSpace.id) {
            // Check if already exists
            // Use filtered items for index finding to prevent index mismatch
            const filteredItems = (s.items || []).filter(Boolean);
            const existsIdx = filteredItems.findIndex(item => 
              item && (item.id === product.id || (item as any).productId === product.id || (item as any).product_id === product.id)
            );
            
            // Safe mapping using logic provided by user
            const price = Number(
              product.price ?? 
              product.unitPrice ?? 
              product.unit_price ?? 
              product.product?.price ?? 
              product.product_snapshot?.price ?? 
              0
            );
            const qty = Number(quantity ?? product.quantity ?? 1);

            if (existsIdx === -1) {
              const newItem: any = {
                id: product.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                product_id: product.productId || product.id,
                name: product.name,
                category: product.category,
                space: spaceName || s.name,
                quantity: qty,
                price: price,
                unitPrice: price,
                unit_price: price,
                subtotal: price * qty,
                image: product.image ?? product.product?.image ?? '',
                brand: product.brand ?? product.product?.brand ?? 'DXG Select',
                addedAt: new Date().toISOString(),
                type: '必买',
                product_snapshot: {
                  ...product,
                  id: product.productId || product.id,
                  name: product.name,
                  category: product.category,
                  price,
                  image: product.image ?? product.product?.image ?? '',
                  brand: product.brand ?? 'DXG Select'
                }
              };
              return { ...s, items: [...filteredItems, newItem] };
            } else {
              // If exists, update quantity
              const updatedItems = [...filteredItems];
              const existingItem = updatedItems[existsIdx];
              const newQty = (existingItem.quantity || 0) + qty;
              updatedItems[existsIdx] = { 
                ...existingItem, 
                quantity: newQty,
                price: price || existingItem.price,
                unitPrice: price || existingItem.unitPrice,
                unit_price: price || existingItem.unit_price,
                subtotal: (price || existingItem.price || 0) * newQty
              };
              return { ...s, items: updatedItems };
            }
          }
          return s;
        });

        // Recalculate totals
        const allItems = updatedSpaces.flatMap(s => (s.items || []).filter(Boolean));
        const productTotal = pricing.calculateProductTotal(allItems);
        const serviceFee = pricing.calculateServiceFee(productTotal);
        const deliveryFee = pricing.calculateDeliveryFee(productTotal);
        const grandTotal = pricing.calculateGrandTotal(productTotal);

        return { 
          ...p, 
          spaces: updatedSpaces, 
          updatedAt: new Date().toISOString().split('T')[0],
          total_product_amount: productTotal,
          service_fee: serviceFee,
          delivery_fee: deliveryFee,
          grand_total: grandTotal,
          budget: {
            ...p.budget,
            furnitureTotal: productTotal,
            estimatedTotal: grandTotal
          }
        };
      }
      return p;
    });
    this.savePlans(updatedPlans);
  },

  removeProductFromPlan(planId: string, productId: string): void {
    const plans = this.getPlans();
    const updatedPlans = plans.map(p => {
      if (p.id === planId) {
        const updatedSpaces = p.spaces.map(s => ({
          ...s,
          items: s.items.filter(i => i.id !== productId)
        }));
        const allItems = updatedSpaces.flatMap(s => s.items);
        const productTotal = pricing.calculateProductTotal(allItems);
        const grandTotal = pricing.calculateGrandTotal(productTotal);

        return { 
          ...p, 
          spaces: updatedSpaces, 
          updatedAt: new Date().toISOString().split('T')[0],
          total_product_amount: productTotal,
          grand_total: grandTotal,
          budget: {
            ...p.budget,
            furnitureTotal: productTotal,
            estimatedTotal: grandTotal
          }
        };
      }
      return p;
    });
    this.savePlans(updatedPlans);
  },

  updateItemQuantity(planId: string, productId: string, quantity: number): void {
    const plans = this.getPlans();
    const updatedPlans = plans.map(p => {
      if (p.id === planId) {
        const updatedSpaces = p.spaces.map(s => ({
          ...s,
          items: (s.items || []).filter(Boolean).map(i => {
            if (i.id === productId) {
              const price = Number(i.price ?? i.unitPrice ?? (i as any).unit_price ?? 0);
              const qty = Number(quantity ?? 1);
              return { ...i, quantity: qty, subtotal: price * qty };
            }
            return i;
          })
        }));

        const allItems = updatedSpaces.flatMap(s => (s.items || []).filter(Boolean));
        const productTotal = pricing.calculateProductTotal(allItems);
        const grandTotal = pricing.calculateGrandTotal(productTotal);

        return { 
          ...p, 
          spaces: updatedSpaces, 
          updatedAt: new Date().toISOString().split('T')[0],
          total_product_amount: productTotal,
          grand_total: grandTotal,
          budget: {
            ...p.budget,
            furnitureTotal: productTotal,
            estimatedTotal: grandTotal
          }
        };
      }
      return p;
    });
    this.savePlans(updatedPlans);
  },

  // --- Product Library (Favorites) ---

  getProductLibrary(): PlanProduct[] {
    const saved = localStorage.getItem(PRODUCT_LIBRARY_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  },

  saveProductToLibrary(product: any): boolean {
    const library = this.getProductLibrary();
    if (library.find(p => p.id === product.id)) return false;
    
    const updated = [product, ...library];
    localStorage.setItem(PRODUCT_LIBRARY_KEY, JSON.stringify(updated));
    return true;
  },

  removeProductFromLibrary(productId: string): void {
    const library = this.getProductLibrary();
    const updated = library.filter(p => p.id !== productId);
    localStorage.setItem(PRODUCT_LIBRARY_KEY, JSON.stringify(updated));
  }
};
