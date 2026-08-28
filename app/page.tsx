'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Bot, 
  Navigation, 
  Search, 
  ChevronRight, 
  Fuel, 
  FileCheck2, 
  ArrowRight,
  ArrowUpRight,
  MessageSquareShare,
  FolderOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const QUICK_SEARCH_CHIPS = [
  { icon: '🚗', label: '관내 출장비', query: '관내 출장 여비 지급 기준 및 산출 방법' },
  { icon: '📄', label: '수의계약 한도', query: '1인 견적 수의계약 체결 가능 금액 한도' },
  { icon: '🍱', label: '강사료 기준', query: '방과후학교 강사료 지급 기준 및 원천징수' },
  { icon: '📜', label: '학교회계 조문', query: '공립학교회계 규칙 예산 및 지출 관련 조항' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentData();
  }, []);

  const fetchRecentData = async () => {
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, category, created_at, board_type')
        .order('created_at', { ascending: false })
        .limit(3);
      if (posts) setRecentPosts(posts);

      const { data: docs } = await supabase
        .from('documents')
        .select('id, file_name, category, created_at, file_size')
        .order('created_at', { ascending: false })
        .limit(3);
      if (docs) setRecentDocs(docs);
    } catch (e) {
      console.error('Error loading feeds:', e);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.open(`https://chatbot.aisen.store?q=${encodeURIComponent(searchQuery.trim())}`, '_blank');
  };

  const handleChipClick = (query: string) => {
    window.open(`https://chatbot.aisen.store?q=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="w-full max-w-[1300px] mx-auto px-5 sm:px-8 py-3.5 sm:py-5 flex flex-col gap-4">
      
      {/* ========================================================
          1. TOP HERO: 컴팩트 스마트 검색 헤더
      ======================================================== */}
      <section className="flex flex-col items-center text-center">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 mb-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-900">AI-SEN v4.9.2</span>
          <span className="text-slate-300">|</span>
          <Fuel size={13} className="text-amber-500" />
          <span className="text-slate-600 font-medium">오피넷 유가 실시간 연동</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3.5xl font-black text-slate-900 tracking-tight leading-tight">
          교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium max-w-[600px]">
          102권 공식 지침서 1:1 쪽수 앵커링 RAG 챗봇과 오피넷 실시간 연동 여비정산기
        </p>

        {/* Wide Omnibar Search Box */}
        <div className="w-full max-w-[800px] mt-3">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400 pointer-events-none" size={19} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 지침(수의계약, 강사료, 복무 등)이나 출장비, 서식을 검색하세요..."
              className="w-full bg-white text-slate-900 border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-xl pl-11 pr-28 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all shadow-xs font-medium"
            />
            <button 
              type="submit" 
              className="absolute right-1.5 btn-primary py-1.5 px-4 text-xs sm:text-sm font-bold shadow-xs rounded-lg"
            >
              <span>질의하기</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Recommended Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-[11px] text-slate-400 font-bold">추천:</span>
            {QUICK_SEARCH_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-0.5 rounded-lg bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 font-semibold transition-all shadow-xs"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* ========================================================
          2. CORE 4 SERVICES: 컴팩트 4분할 인터랙티브 카드
      ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* CARD 1: 스마트 여비정산기 */}
        <a 
          href="https://chatbot.aisen.store/travel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between min-h-[145px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Navigation size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  v4.9.2
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              스마트 여비정산기
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              카카오 3개 경유지 &amp; 오피넷 유가 연동 출장비 산출
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
            <span>정산기 바로가기</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 2: 3-Tier AI 챗봇 */}
        <a 
          href="https://chatbot.aisen.store" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between min-h-[145px] group hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <Bot size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  3-Tier
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              AI 행정 챗봇
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              28개 서고 지침서 1:1 쪽수 뷰어 &amp; 국가법령 연동
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
            <span>AI 질의하기</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 3: 행정 자료실 */}
        <Link 
          href="/archive" 
          className="glass-card p-4 flex flex-col justify-between min-h-[145px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <FolderOpen size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  102권 서고
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              행정 자료실 &amp; 지침서
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              102권 공식 지침서 스트리밍 &amp; 학교 실무 서식
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>자료실 바로가기</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* CARD 4: 업무 소통 게시판 */}
        <Link 
          href="/board" 
          className="glass-card p-4 flex flex-col justify-between min-h-[145px] group hover:border-sky-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
                <MessageSquareShare size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                  미가입 작성
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              업무 소통 게시판
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              가입 없이 4자리 암호로 실무 질의 및 팁 공유
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-bold">
            <span>게시판 바로가기</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </section>

      {/* ========================================================
          3. REAL-TIME FEEDS: 슬림형 3줄 2-Column 대시보드
      ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Latest Posts Feed */}
        <div className="glass-panel p-4 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquareShare size={15} />
              </div>
              <span>최신 공지 및 업무 공유</span>
            </div>
            <Link href="/board" className="text-xs text-slate-500 hover:text-blue-600 font-bold flex items-center gap-0.5 transition-colors">
              <span>더보기</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="flex flex-col gap-1.5">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link 
                  key={post.id} 
                  href="/board" 
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 transition-colors border border-slate-100 text-xs sm:text-sm group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-blue-100/80 text-blue-800 font-bold shrink-0">
                      {post.category || '공지'}
                    </span>
                    <span className="text-slate-800 font-medium truncate group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">등록된 게시물이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Latest Docs Feed */}
        <div className="glass-panel p-4 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCheck2 size={15} />
              </div>
              <span>최신 등록 서식 문서</span>
            </div>
            <Link href="/archive" className="text-xs text-slate-500 hover:text-emerald-600 font-bold flex items-center gap-0.5 transition-colors">
              <span>더보기</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="flex flex-col gap-1.5">
            {recentDocs.length > 0 ? (
              recentDocs.map((doc) => (
                <Link 
                  key={doc.id} 
                  href="/archive" 
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-emerald-50/60 transition-colors border border-slate-100 text-xs sm:text-sm group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-emerald-100/80 text-emerald-800 font-bold shrink-0">
                      {doc.category || '서식'}
                    </span>
                    <span className="text-slate-800 font-medium truncate group-hover:text-emerald-600 transition-colors">
                      {doc.file_name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">등록된 서식이 없습니다.</div>
            )}
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="w-full pt-2 pb-1 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 font-semibold">
          <a href="https://chatbot.aisen.store" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">AI 챗봇</a>
          <Link href="/chatbot" className="hover:text-blue-600">구글 챗봇</Link>
          <a href="https://chatbot.aisen.store/travel" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">여비정산기</a>
          <Link href="/archive" className="hover:text-blue-600">자료실</Link>
          <Link href="/tools" className="hover:text-blue-600">미니툴</Link>
          <Link href="/board" className="hover:text-blue-600">게시판</Link>
        </div>
      </footer>

    </div>
  );
}
