import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

export const aiService = {
  async trackAiEvent(type: string, input: any, output: any, planId?: string) {
    const anonId = authService.getAnonymousId();
    const user = await authService.getCurrentUser();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('ai_events').insert({
        user_id: user?.id,
        anonymous_id: anonId,
        plan_id: planId,
        event_type: type,
        input,
        output,
        model: 'gemini-pro' // Mocking model name
      });
    } else {
      const events = JSON.parse(localStorage.getItem('dxg_ai_events') || '[]');
      events.push({
        event_type: type,
        input,
        output,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('dxg_ai_events', JSON.stringify(events.slice(-50)));
    }
  },

  async analyzePlan(plan: any) {
    // This is where real Gemini API would be called.
    // For now, we simulate a response based on rules.
    const advice = plan.total_product_amount > 100000 
      ? '你的方案配置已达到高端水准，建议在灯光营造和艺术品点缀上增加预算，提升空间生命力。'
      : '方案选品性价比很高，建议关注主卧床垫的支撑性，这是提升居住幸福感的关键。';
    
    await this.trackAiEvent('analyze_plan', { planId: plan.id }, { advice }, plan.id);
    return advice;
  },

  async generatePlan(profile: any) {
    const planName = `${profile.styleFeelings?.[0] || '现代'}风格${profile.areaRange || '全屋'}全案`;
    const result = { name: planName, suggestion: '已基于你的偏好筛选出 8 件极力推荐的单品。' };
    
    await this.trackAiEvent('generate_plan', profile, result);
    return result;
  }
};
