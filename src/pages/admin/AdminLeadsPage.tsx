import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, ArrowLeft, MessageSquare, CheckCircle2, 
  XCircle, Filter, Search, MoreHorizontal, MapPin
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { leadService } from '../../services/leadService';
import Toast from '../../components/Toast';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function AdminLeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        setLeads(data || []);
      } else {
        const local = JSON.parse(localStorage.getItem('dxg_leads') || '[]');
        setLeads(local);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('leads').update({ status }).eq('id', id);
      } else {
        const local = JSON.parse(localStorage.getItem('dxg_leads') || '[]');
        const updated = local.map((l: any) => l.id === id ? { ...l, status } : l);
        localStorage.setItem('dxg_leads', JSON.stringify(updated));
      }
      setToastMessage('状态更新成功');
      loadLeads();
    } catch (e) {
      setToastMessage('操作失败');
    }
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      'new': 'bg-blue-500/10 text-blue-500',
      'contacted': 'bg-amber-500/10 text-amber-500',
      'qualified': 'bg-purple-500/10 text-purple-500',
      'converted': 'bg-emerald-500/10 text-emerald-500',
      'lost': 'bg-white/10 text-white/30'
    };
    return map[status] || 'bg-white/5 text-white/40';
  };

  if (loading) return <div className="min-h-screen pt-40 px-12 text-center text-white/40">加载中...</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 text-left">
          <Breadcrumbs 
            isDark={true}
            items={[
              { name: '个人中心', path: '/profile' },
              { name: '管理后台', path: '/admin' },
              { name: '线索管理' }
            ]} 
          />
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold text-[14px]"
          >
            <ArrowLeft className="w-4 h-4" /> 返回管理中心
          </button>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
           <header className="text-left">
              <h1 className="text-[42px] font-black text-white tracking-tight">客户线索管理</h1>
           </header>
           <div className="flex gap-4">
              <div className="relative group">
                 <input 
                   type="text" 
                   placeholder="搜索客户姓名/电话" 
                   className="bg-white/5 border border-white/10 rounded-2xl px-12 py-3 text-white font-bold w-[300px] focus:border-brand outline-none transition-all"
                 />
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-brand transition-colors" />
              </div>
              <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-black hover:bg-white/10 transition-all flex items-center gap-2">
                 <Filter className="w-5 h-5" /> 筛选
              </button>
           </div>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">客户姓名</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">城市</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">意向楼盘/时间</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">当前状态</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest text-right">时间</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest text-center">操作</th>
                 </tr>
              </thead>
              <tbody>
                 {leads.map(l => (
                   <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all group">
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 font-black">{l.name?.[0] || 'U'}</div>
                            <div>
                               <p className="text-[16px] font-black text-white">{l.name}</p>
                               <p className="text-[13px] text-white/40 font-bold">{l.phone}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-2 text-white/60 font-bold">
                            <MapPin className="w-4 h-4" /> {l.city || '未知'}
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <p className="text-[14px] text-white/60 font-bold mb-1">{l.community || '未填写'}</p>
                         <p className="text-[12px] text-white/20 font-black uppercase tracking-widest">{l.move_in_time || '计划中'}</p>
                      </td>
                      <td className="px-8 py-8">
                         <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border border-white/5 ${getStatusStyle(l.status)}`}>
                            {l.status === 'new' ? '新入库' : l.status === 'contacted' ? '已沟通' : l.status === 'qualified' ? '高意向' : l.status === 'converted' ? '已转化' : '未成效'}
                         </span>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <p className="text-[13px] text-white/20 font-bold">{new Date(l.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex items-center justify-center gap-3">
                            <button onClick={() => handleUpdateStatus(l.id, 'contacted')} className="w-10 h-10 rounded-lg bg-white/5 text-white/40 hover:bg-brand/10 hover:text-brand transition-all flex items-center justify-center"><MessageSquare className="w-5 h-5" /></button>
                            <button onClick={() => handleUpdateStatus(l.id, 'converted')} className="w-10 h-10 rounded-lg bg-white/5 text-white/40 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></button>
                            <button onClick={() => handleUpdateStatus(l.id, 'lost')} className="w-10 h-10 rounded-lg bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center"><XCircle className="w-5 h-5" /></button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {leads.length === 0 && <div className="py-20 text-center text-white/20 font-bold">暂无客户线索</div>}
        </div>
      </div>
      <Toast 
        message={toastMessage} 
        onClear={() => setToastMessage(null)} 
      />
    </main>
  );
}
