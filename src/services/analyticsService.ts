import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

export const analyticsService = {
  async track(eventName: string, properties: any = {}) {
    console.log(`[Analytics] ${eventName}`, properties);
    
    const anonId = authService.getAnonymousId();
    const user = await authService.getCurrentUser();
    
    if (isSupabaseConfigured && supabase) {
      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        anonymous_id: anonId,
        event_name: eventName,
        page_path: window.location.pathname,
        properties
      });
    } else {
      const events = JSON.parse(localStorage.getItem('dxg_analytics_events') || '[]');
      events.push({
        event_name: eventName,
        anonymous_id: anonId,
        page_path: window.location.pathname,
        properties,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('dxg_analytics_events', JSON.stringify(events.slice(-100))); // Keep last 100
    }
  },

  trackPageView(path: string) {
    this.track('page_view', { path });
  }
};
