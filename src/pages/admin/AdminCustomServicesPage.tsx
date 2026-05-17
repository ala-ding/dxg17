import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  User, 
  Phone, 
  Clock, 
  MoreVertical,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { customService } from '../../services/customService';

export default function AdminCustomServicesPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customService.getCustomServiceRequests().then(data => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'contacted': return 'bg-blue-500/10 text-blue-500';
      case 'evaluating': return 'bg-purple-500/10 text-purple-500';
      case 'quoted': return 'bg-indigo-500/10 text-indigo-500';
      case 'converted': return 'bg-green-500/10 text-green-500';
      case 'closed': return 'bg-gray-500/10 text-gray-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      contacted: '已联系',
      evaluating: '评估中',
      quoted: '已报价',
      converted: '已转化',
      closed: '已关闭'
    };
    return map[status] || status;
  };

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-screen p-8 pt-24 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">定制服务申请</h1>
            <p className="text-white/40 font-medium">管理用户提交的高级定制服务需求线索</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white text-[14px] w-64 focus:border-brand/50 transition-all outline-none"
                placeholder="搜索申请人..."
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all text-[14px] font-bold">
              <Filter className="w-4 h-4" />
              筛选器
            </button>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-5 text-[12px] font-black text-white/30 uppercase">申请信息</th>
                <th className="px-6 py-5 text-[12px] font-black text-white/30 uppercase">需求详情</th>
                <th className="px-6 py-5 text-[12px] font-black text-white/30 uppercase">所在城市</th>
                <th className="px-6 py-5 text-[12px] font-black text-white/30 uppercase">状态</th>
                <th className="px-6 py-5 text-[12px] font-black text-white/30 uppercase">时间</th>
                <th className="px-6 py-5 text-[12px] font-black text-white/30 uppercase text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-6 border-none">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-white">{req.name}</p>
                        <p className="text-[12px] text-white/40 font-bold">{req.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-none">
                    <div>
                      <span className="text-[12px] px-2 py-0.5 bg-brand/10 text-brand rounded-md font-black mr-2">
                        {req.service_type}
                      </span>
                      <p className="text-[13px] text-white/60 mt-1 line-clamp-1">{req.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-none">
                    <span className="text-white/40 text-[14px] font-bold">{req.city || '未填'}</span>
                  </td>
                  <td className="px-6 py-6 border-none">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-black ${getStatusColor(req.status)}`}>
                      {getStatusLabel(req.status)}
                    </span>
                  </td>
                  <td className="px-6 py-6 border-none">
                    <div className="flex items-center gap-2 text-white/30 text-[13px] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-6 border-none text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 bg-white/5 text-white/40 hover:text-brand hover:bg-brand/10 rounded-lg transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/10">
                      <ClipboardList className="w-8 h-8" />
                    </div>
                    <p className="text-white/20 font-black text-xl">暂无申请需求</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
