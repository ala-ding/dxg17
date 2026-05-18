import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Palette, Maximize2, Wallet, FileText, ChevronDown, CheckCircle2, Info } from 'lucide-react';

interface EditPlanModalProps {
  open: boolean;
  plan: any;
  onClose: () => void;
  onSave: (patch: any) => Promise<void>;
}

function CustomSelect({ label, value, options, onChange, icon: Icon, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.value === value);

  return (
    <div className="space-y-3 relative" ref={ref}>
      <label className="text-[12px] font-black text-white/20 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-14 md:h-16 bg-white/5 border rounded-2xl px-5 md:px-6 text-white text-[15px] md:text-[16px] flex items-center justify-between cursor-pointer transition-all font-bold ${
          isOpen ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-white/10 hover:border-white/20'
        } ${value ? 'text-white' : 'text-white/20'}`}
      >
        <span className="truncate">{selectedOption?.label || value || placeholder || '请选择'}</span>
        <ChevronDown className={`w-5 h-5 text-white/20 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-brand' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[600] top-[105%] left-0 right-0 bg-[#202020] border border-white/12 rounded-[22px] shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden py-2"
          >
            <div className="max-h-[280px] overflow-y-auto no-scrollbar">
              {options.map((option: any) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`px-6 py-4 text-[14px] md:text-[15px] font-bold cursor-pointer transition-all flex items-center justify-between group ${
                    value === option.value 
                      ? 'bg-brand/10 text-brand' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && <CheckCircle2 className="w-4 h-4 text-brand" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EditPlanModal({ open, plan, onClose, onSave }: EditPlanModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    style: '',
    areaRange: '',
    budgetLimit: '',
    houseType: '',
    familySize: '',
    livingNeeds: '',
    spaces: [] as string[],
    priorities: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (plan && open) {
      setFormData({
        name: plan.name || '',
        style: plan.preferredStyle || plan.style || '',
        areaRange: plan.areaRange || plan.area_range || '',
        budgetLimit: plan.budgetLimit || plan.budgetRange || plan.budget_range || '',
        houseType: plan.houseType || plan.house_type || '',
        familySize: plan.familySize || plan.family_size || '',
        livingNeeds: plan.livingNeeds || plan.living_needs || '',
        spaces: Array.isArray(plan.spaces) ? plan.spaces.map((s: any) => typeof s === 'string' ? s : s.name) : [],
        priorities: plan.priorities || '',
        notes: plan.notes || plan.note || ''
      });
    }
  }, [plan, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalName = formData.name.trim();
      const isOnlyNumbers = /^\d+$/.test(finalName);
      
      if (!finalName || (finalName.length < 2 && finalName !== '') || isOnlyNumbers) {
        if (finalName === '' || isOnlyNumbers) {
          const now = new Date();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          finalName = `${formData.style || '现代简约'}方案 - ${month}月${day}日`;
        }
      }

      await onSave({
        ...formData,
        name: finalName,
        area_range: formData.areaRange,
        budget_range: formData.budgetLimit,
        house_type: formData.houseType,
        family_size: formData.familySize,
        living_needs: formData.livingNeeds,
        note: formData.notes,
        preferredStyle: formData.style,
        budgetLimit: formData.budgetLimit,
        areaRange: formData.areaRange
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#141414] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
          >
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 flex items-center justify-between border-b border-white/5 relative bg-[#141414]/50 backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] pointer-events-none" />
              <div>
                <h3 className="text-[22px] sm:text-[28px] font-black text-white mb-1 md:mb-2">编辑方案</h3>
                <div className="flex items-center gap-2 text-brand/60 font-medium text-[11px] md:text-[13px]">
                   <Info className="w-3 h-3 md:w-3.5 md:h-3.5" />
                   <span>信息越完整，AI 推荐越精准</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all shadow-lg"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 md:space-y-10 no-scrollbar">
              <div className="space-y-3">
                <label className="text-[11px] md:text-[12px] font-black text-white/20 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> 方案名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：御湖半岛 现代简约方案"
                  className="w-full h-14 md:h-16 bg-white/5 border border-white/10 rounded-2xl px-5 md:px-6 text-white text-[16px] md:text-[17px] focus:border-brand outline-none transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <CustomSelect 
                  label="方案风格" value={formData.style} icon={Palette}
                  options={[
                    { label: '现代简约', value: '现代简约' },
                    { label: '极简原木', value: '极简原木' },
                    { label: '奶油风', value: '奶油风' },
                    { label: '轻奢主义', value: '轻奢主义' },
                    { label: '中古风', value: '中古风' }
                  ]}
                  onChange={(v: string) => setFormData({ ...formData, style: v })}
                />
                <CustomSelect 
                  label="预计面积" value={formData.areaRange} icon={Maximize2} placeholder="选择面积"
                  options={[
                    { label: '60-90㎡ (简约紧凑)', value: '60-90㎡' },
                    { label: '90-120㎡ (标准户型)', value: '90-120㎡' },
                    { label: '120-150㎡ (舒适生活)', value: '120-150㎡' },
                    { label: '150㎡+ (大宅空间)', value: '150㎡+' }
                  ]}
                  onChange={(v: string) => setFormData({ ...formData, areaRange: v })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <CustomSelect 
                  label="户型" value={formData.houseType} placeholder="选择户型"
                  options={[
                    { label: '1房1厅', value: '1房1厅' }, { label: '2房1厅', value: '2房1厅' }, { label: '2房2厅', value: '2房2厅' }, { label: '3房1厅', value: '3房1厅' }, { label: '3房2厅', value: '3房2厅' }, { label: '4房2厅', value: '4房2厅' }, { label: '复式/别墅', value: '复式/别墅' }
                  ]}
                  onChange={(v: string) => setFormData({ ...formData, houseType: v })}
                />
                <CustomSelect 
                  label="家庭人数" value={formData.familySize} placeholder="选择人数"
                  options={[
                    { label: '独居', value: '独居' }, { label: '两人世界', value: '两人世界' }, { label: '三口之家', value: '三口之家' }, { label: '四口之家', value: '四口之家' }, { label: '五口以上', value: '五口以上' }
                  ]}
                  onChange={(v: string) => setFormData({ ...formData, familySize: v })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] md:text-[12px] font-black text-white/20 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5" /> 预算档位
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {['8-15万', '15-25万', '25-35万', '35万+'].map((range) => (
                    <button
                      key={range} type="button" onClick={() => setFormData({ ...formData, budgetLimit: range })}
                      className={`h-12 md:h-14 rounded-xl border font-bold text-[13px] md:text-[14px] transition-all ${
                        formData.budgetLimit === range 
                          ? 'border-brand bg-brand/10 text-brand' 
                          : 'border-white/5 bg-white/5 text-white/40 hover:border-white/10'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] md:text-[12px] font-black text-white/20 uppercase tracking-[0.2em] px-1">
                  需要配置的空间
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {['客厅', '餐厅', '主卧', '次卧', '书房', '儿童房', '阳台'].map((space) => (
                    <button
                      key={space} type="button"
                      onClick={() => {
                        const newSpaces = formData.spaces.includes(space) ? formData.spaces.filter(s => s !== space) : [...formData.spaces, space];
                        setFormData({ ...formData, spaces: newSpaces });
                      }}
                      className={`px-4 md:px-6 py-2 md:py-3 rounded-full border font-bold text-[12px] md:text-[13px] transition-all ${
                        formData.spaces.includes(space)
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-white/5 bg-white/5 text-white/40'
                      }`}
                    >
                      {space}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] md:text-[12px] font-black text-white/20 uppercase tracking-[0.2em] px-1">重点关注</label>
                <input
                  type="text" value={formData.priorities} onChange={e => setFormData({ ...formData, priorities: e.target.value })}
                  placeholder="例如：环保等级、收纳空间等"
                  className="w-full h-14 md:h-16 bg-white/5 border border-white/10 rounded-2xl px-5 md:px-6 text-white text-[15px] focus:border-brand outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-3 pb-4">
                <label className="text-[11px] md:text-[12px] font-black text-white/20 uppercase tracking-[0.2em] px-1">备注信息</label>
                <textarea
                  value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="补充说明..."
                  className="w-full h-28 md:h-32 bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 text-white text-[15px] focus:border-brand outline-none transition-all font-medium resize-none"
                />
              </div>
            </form>

            <div className="px-6 md:px-10 py-6 md:py-8 bg-[#1A1A1A] border-t border-white/5 flex gap-3 md:gap-4 pb-safe-area">
              <button
                type="button" onClick={onClose}
                className="flex-1 h-14 md:h-16 bg-white/5 text-white/40 rounded-2xl font-bold text-[15px] md:text-[16px]"
              >
                取消
              </button>
              <button
                type="button" onClick={handleSubmit} disabled={isSaving}
                className="flex-[2] h-14 md:h-16 bg-brand text-white rounded-2xl font-black text-[16px] md:text-[17px] shadow-xl shadow-brand/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSaving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                保存方案
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
