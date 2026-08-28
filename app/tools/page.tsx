'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Zap, 
  Calculator, 
  Calendar, 
  FileSpreadsheet, 
  Bot, 
  Navigation,
  Fuel,
  Printer,
  ChevronRight, 
  ArrowUpRight, 
  Wrench, 
  X, 
  Edit3,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ToolItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon_type: string;
}

const CATEGORIES = ["전체", "행정툴", "예산툴", "시설툴", "기타"];

const ICON_MAP: { [key: string]: React.ReactNode } = {
  'Zap': <Zap size={22} />,
  'Calculator': <Calculator size={22} />,
  'Calendar': <Calendar size={22} />,
  'Spreadsheet': <FileSpreadsheet size={22} />,
  'Tool': <Wrench size={22} />,
};

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [newTool, setNewTool] = useState({
    title: '',
    description: '',
    url: '',
    category: '행정툴',
    icon_type: 'Zap'
  });

  useEffect(() => {
    checkAdmin();
    fetchTools();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(session?.user?.email === 'bamnamoo@gmail.com');
  };

  const fetchTools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (tool?: ToolItem) => {
    if (tool) {
      setEditingToolId(tool.id);
      setNewTool({
        title: tool.title,
        description: tool.description,
        url: tool.url,
        category: tool.category,
        icon_type: tool.icon_type
      });
    } else {
      setEditingToolId(null);
      setNewTool({ title: '', description: '', url: '', category: '행정툴', icon_type: 'Zap' });
    }
    setShowAddModal(true);
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingToolId) {
        const { error } = await supabase.from('tools').update(newTool).eq('id', editingToolId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tools').insert([newTool]);
        if (error) throw error;
      }
      setShowAddModal(false);
      setEditingToolId(null);
      fetchTools();
    } catch (error: any) {
      alert(`실패: ${error.message}`);
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm('프로그램을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('tools').delete().eq('id', id);
      if (error) throw error;
      fetchTools();
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  const filteredTools = tools.filter(tool => {
    const titleMatch = tool.title.toLowerCase().includes(search.toLowerCase()) || 
                       tool.description?.toLowerCase().includes(search.toLowerCase());
    const toolCat = (tool.category || "").normalize('NFC').trim();
    const activeCat = activeCategory.normalize('NFC').trim();
    const categoryMatch = activeCat === "전체" || toolCat === activeCat;
    return titleMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 px-4 md:px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-xs font-bold text-blue-300 mb-2">
              <Zap size={14} className="text-blue-400" />
              <span>스마트 행정 툴킷</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">행정 미니 프로그램</h1>
            <p className="text-sm text-slate-400 mt-1">교육행정 업무의 계산 및 처리를 신속하게 돕는 유용한 도구 모음입니다.</p>
          </div>

          {isAdmin && (
            <button 
              onClick={() => handleOpenAddModal()} 
              className="btn-primary py-2.5 px-5 self-start md:self-auto text-xs"
            >
              <Plus size={16} />
              <span>새 도구 등록</span>
            </button>
          )}
        </div>

        {/* ========================================================
            FLAGSHIP TOOL 1: 스마트 여비정산기 & 출장 유류비 계산기
        ======================================================== */}
        <div className="glass-card p-6 md:p-8 border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-slate-900/90 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-[700px]">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black tracking-tight">
                  ⭐ 대표 플래그십 툴
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  v4.9.2 최신 버전
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-blue-300 transition-colors">
                공무원 스마트 여비정산기 &amp; 출장 유류비 계산기
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                카카오 모빌리티 실시간 다구간(최대 3개 경유지) 길찾기와 한국석유공사 오피넷(1일 6회 자동 고시) 유가를 연동하여 관내/관외 출장 여비, 19종 법정 감액, A4 1페이지 에코 화이트 인쇄를 지원합니다.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-4 text-xs text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">🚩 3개 경유지 길찾기</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">⛽ 오피넷 전국 실시간 유가</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">🖨️ A4 1페이지 공문서 인쇄</span>
              </div>
            </div>

            <div className="shrink-0">
              <a 
                href="https://chatbot.aisen.store/travel" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary py-3.5 px-6 text-sm flex items-center gap-2"
              >
                <span>여비정산기 바로 열기</span>
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="프로그램 검색..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">데이터를 불러오는 중...</div>
        ) : filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div 
                key={tool.id} 
                className="glass-card p-6 flex flex-col justify-between group border-slate-800 hover:border-blue-500/40 relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {ICON_MAP[tool.icon_type] || <Zap size={20} />}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {tool.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {tool.description || '상세 설명이 없습니다.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenAddModal(tool)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                        title="수정"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTool(tool.id)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  <a 
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary py-1.5 px-3.5 text-xs ml-auto flex items-center gap-1"
                  >
                    <span>실행</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800/60">
            등록된 미니 프로그램이 없습니다.
          </div>
        )}

      </div>

      {/* Admin Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-950 p-6 md:p-8 max-w-[500px] w-full border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingToolId ? '미니 프로그램 수정' : '새 미니 프로그램 등록'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTool} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">프로그램 이름</label>
                <input 
                  type="text" 
                  required
                  value={newTool.title}
                  onChange={(e) => setNewTool({...newTool, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="예: 수당 계산기"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">접속 URL</label>
                <input 
                  type="url" 
                  required
                  value={newTool.url}
                  onChange={(e) => setNewTool({...newTool, url: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">카테고리</label>
                  <select 
                    value={newTool.category}
                    onChange={(e) => setNewTool({...newTool, category: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.filter(c => c !== "전체").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">아이콘</label>
                  <select 
                    value={newTool.icon_type}
                    onChange={(e) => setNewTool({...newTool, icon_type: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Zap">번개 (Zap)</option>
                    <option value="Calculator">계산기 (Calculator)</option>
                    <option value="Calendar">달력 (Calendar)</option>
                    <option value="Spreadsheet">엑셀 (Spreadsheet)</option>
                    <option value="Tool">도구 (Tool)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">설명</label>
                <textarea 
                  rows={3}
                  value={newTool.description}
                  onChange={(e) => setNewTool({...newTool, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="프로그램의 용도와 기능을 간단히 작성하세요."
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn-primary py-2 px-5 text-xs"
                >
                  {editingToolId ? '수정 완료' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
