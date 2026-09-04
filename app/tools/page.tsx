'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Zap, 
  Calculator, 
  Calendar, 
  FileSpreadsheet, 
  Navigation,
  ChevronRight, 
  ArrowUpRight, 
  Wrench, 
  X, 
  FilePenLine
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
  'Zap': <Zap size={20} />,
  'Calculator': <Calculator size={20} />,
  'Calendar': <Calendar size={20} />,
  'Spreadsheet': <FileSpreadsheet size={20} />,
  'Tool': <Wrench size={20} />,
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 px-4 md:px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-[1100px] flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 mb-2">
              <Zap size={13} className="text-blue-600" />
              <span>스마트 행정 툴킷</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">행정 미니 프로그램</h1>
            <p className="text-sm text-slate-500 mt-1">교육행정 업무의 계산 및 처리를 신속하게 돕는 도구 모음입니다.</p>
          </div>

          {isAdmin && (
            <button 
              onClick={() => handleOpenAddModal()} 
              className="btn-primary py-2 px-4 self-start md:self-auto text-xs"
            >
              <Plus size={15} />
              <span>새 도구 등록</span>
            </button>
          )}
        </div>

        {/* Flagship Tool Card */}
        <div className="glass-card p-6 md:p-7 border-blue-200 bg-gradient-to-r from-blue-50/50 via-white to-white relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-600 text-white text-[11px] font-bold">
                  대표 툴
                </span>
                <span className="text-xs font-semibold text-emerald-600">v4.9.2 최신 버전</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                공무원 스마트 여비정산기 &amp; 출장 유류비 계산기
              </h2>
              <p className="mt-1.5 text-xs text-slate-600 max-w-[650px] leading-relaxed">
                카카오 실시간 3개 경유지 길찾기와 오피넷 1일 6회 유가 연동 출장비 산출, 19종 법정 감액, A4 1페이지 에코 화이트 인쇄 지원.
              </p>
            </div>

            <a 
              href="https://chatbot.aisen.store/travel" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary py-2.5 px-5 text-xs font-semibold shrink-0"
            >
              <span>여비정산기 열기</span>
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="프로그램 검색..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">데이터를 불러오는 중...</div>
        ) : filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <div 
                key={tool.id} 
                className="glass-card p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                      {ICON_MAP[tool.icon_type] || <Zap size={18} />}
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {tool.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {tool.description || '상세 설명이 없습니다.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleOpenAddModal(tool)} 
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                        title="수정"
                      >
                        <FilePenLine size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTool(tool.id)} 
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  {(() => {
                    let finalUrl = tool.url;
                    if (finalUrl?.includes('sikdae.streamlit.app')) finalUrl = '/tools/sikdae';
                    if (finalUrl?.includes('sen-excel-splitter.streamlit.app')) finalUrl = '/tools/sheet-splitter';
                    if (finalUrl?.includes('label-maker-two.vercel.app')) finalUrl = '/tools/label-maker';
                    if (finalUrl?.includes('bamnamoo-dev.github.io/gym')) finalUrl = '/tools/gym-calc';
                    if (finalUrl?.includes('bamnamoo-dev.github.io/classmap')) finalUrl = '/tools/classmap';
                    if (finalUrl?.includes('bamnamoo-dev.github.io/SFD')) finalUrl = '/tools/sfd';
                    if (finalUrl?.includes('project-np0t7.vercel.app')) finalUrl = '/tools/watermelon';
                    if (finalUrl?.includes('cost-audit')) finalUrl = '/tools/cost-audit';
                    const isInternal = finalUrl?.startsWith('/');

                    if (isInternal) {
                      return (
                        <Link 
                          href={finalUrl} 
                          className="btn-primary py-1 px-3 text-xs ml-auto flex items-center gap-1 bg-blue-600"
                        >
                          <span>실행 (내장)</span>
                          <ChevronRight size={13} />
                        </Link>
                      );
                    }

                    return (
                      <a 
                        href={finalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-secondary py-1 px-3 text-xs ml-auto flex items-center gap-1"
                      >
                        <span>실행</span>
                        <ArrowUpRight size={13} />
                      </a>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            등록된 미니 프로그램이 없습니다.
          </div>
        )}

      </div>

      {/* Admin Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 md:p-8 max-w-[480px] w-full rounded-2xl shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingToolId ? '미니 프로그램 수정' : '새 미니 프로그램 등록'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTool} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">프로그램 이름</label>
                <input 
                  type="text" 
                  required
                  value={newTool.title}
                  onChange={(e) => setNewTool({...newTool, title: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="예: 수당 계산기"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">접속 URL</label>
                <input 
                  type="url" 
                  required
                  value={newTool.url}
                  onChange={(e) => setNewTool({...newTool, url: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">카테고리</label>
                  <select 
                    value={newTool.category}
                    onChange={(e) => setNewTool({...newTool, category: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.filter(c => c !== "전체").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">아이콘</label>
                  <select 
                    value={newTool.icon_type}
                    onChange={(e) => setNewTool({...newTool, icon_type: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
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
                <label className="text-xs font-bold text-slate-700 mb-1 block">설명</label>
                <textarea 
                  rows={3}
                  value={newTool.description}
                  onChange={(e) => setNewTool({...newTool, description: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="프로그램의 용도와 기능을 간단히 작성하세요."
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary py-1.5 px-3.5 text-xs"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn-primary py-1.5 px-4 text-xs font-bold"
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
