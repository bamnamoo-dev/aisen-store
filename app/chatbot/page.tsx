'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ExternalLink, Bot, MessageSquare, ChevronRight, ArrowUpRight, Edit3, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIBot {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon_type: string;
}

const CATEGORIES = ["전체", "예산지침", "계약", "인사", "급여", "회계", "지출", "매뉴얼", "기타"];

export default function ChatbotPage() {
  const [bots, setBots] = useState<AIBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [newBot, setNewBot] = useState({
    title: '',
    description: '',
    url: '',
    category: '예산지침',
    icon_type: 'Bot'
  });

  useEffect(() => {
    checkAdmin();
    fetchBots();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(session?.user?.email === 'bamnamoo@gmail.com');
  };

  const fetchBots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_bots')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      console.error('Error fetching bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (bot?: AIBot) => {
    if (bot) {
      setEditingBotId(bot.id);
      setNewBot({
        title: bot.title,
        description: bot.description,
        url: bot.url,
        category: bot.category,
        icon_type: bot.icon_type
      });
    } else {
      setEditingBotId(null);
      setNewBot({
        title: '',
        description: '',
        url: '',
        category: '예산지침',
        icon_type: 'Bot'
      });
    }
    setShowAddModal(true);
  };

  const handleSubmitBot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBotId) {
        const { error } = await supabase.from('ai_bots').update(newBot).eq('id', editingBotId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ai_bots').insert([newBot]);
        if (error) throw error;
      }
      setShowAddModal(false);
      setEditingBotId(null);
      fetchBots();
    } catch (error: any) {
      alert(`실패: ${error.message}`);
    }
  };

  const handleDeleteBot = async (id: string) => {
    if (!confirm('지침 챗봇을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('ai_bots').delete().eq('id', id);
      if (error) throw error;
      fetchBots();
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  const filteredBots = bots.filter(bot => {
    const titleMatch = bot.title.toLowerCase().includes(search.toLowerCase()) || 
                       bot.description.toLowerCase().includes(search.toLowerCase());
    const botCat = (bot.category || "").normalize('NFC').trim();
    const activeCat = activeCategory.normalize('NFC').trim();
    const categoryMatch = activeCategory === "전체" || botCat === activeCat;
    return titleMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 px-4 md:px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-[1100px] flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-xs font-bold text-blue-300 mb-2">
              <MessageSquare size={14} className="text-blue-400" />
              <span>노트북LM &amp; 맞춤형 지침 봇</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">구글 챗봇 모음</h1>
            <p className="text-sm text-slate-400 mt-1">
              구글 노트북LM(NotebookLM) 및 커스텀 AI로 생성된 분야별 특화 지침 챗봇 링크 목록입니다.
            </p>
          </div>

          {isAdmin && (
            <button 
              onClick={() => handleOpenAddModal()} 
              className="btn-primary py-2.5 px-5 self-start md:self-auto text-xs font-bold"
            >
              <Plus size={16} />
              <span>새 챗봇 등록</span>
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="챗봇 이름 검색..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bots Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">데이터를 불러오는 중...</div>
        ) : filteredBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBots.map((bot) => (
              <div 
                key={bot.id} 
                className="glass-card p-6 flex flex-col justify-between group border-slate-800 hover:border-blue-500/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-blue-300 border border-slate-800">
                      {bot.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                    {bot.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {bot.description || '구글 노트북LM 기반 교육행정 특화 챗봇입니다.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenAddModal(bot)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                        title="수정"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteBot(bot.id)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  <a 
                    href={bot.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary py-1.5 px-3.5 text-xs ml-auto flex items-center gap-1"
                  >
                    <span>챗봇 열기</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800/60">
            등록된 구글 챗봇이 없습니다.
          </div>
        )}

      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-950 p-6 md:p-8 max-w-[500px] w-full border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingBotId ? '구글 챗봇 수정' : '새 구글 챗봇 등록'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitBot} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">챗봇 제목</label>
                <input 
                  type="text" 
                  required
                  value={newBot.title}
                  onChange={(e) => setNewBot({...newBot, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="예: 2026 계약실무 지침 챗봇"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">구글 노트북LM 또는 챗봇 URL</label>
                <input 
                  type="url" 
                  required
                  value={newBot.url}
                  onChange={(e) => setNewBot({...newBot, url: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://notebooklm.google.com/..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">카테고리</label>
                <select 
                  value={newBot.category}
                  onChange={(e) => setNewBot({...newBot, category: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.filter(c => c !== "전체").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">설명</label>
                <textarea 
                  rows={3}
                  value={newBot.description}
                  onChange={(e) => setNewBot({...newBot, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="챗봇의 주요 답변 범위와 활용 팁을 작성하세요."
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
                  {editingBotId ? '수정 완료' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
