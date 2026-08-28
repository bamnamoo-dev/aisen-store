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
  { label: '🚗 관내 출장비 계산', query: '관내 출장 여비 지급 기준 및 산출 방법' },
  { label: '📄 1인 견적 수의계약 한도', query: '1인 견적 수의계약 체결 가능 금액 한도' },
  { label: '🍱 방과후 강사료 기준', query: '방과후학교 강사료 지급 기준 및 원천징수' },
  { label: '📜 학교회계 규칙 조문', query: '공립학교회계 규칙 예산 및 지출 관련 조항' },
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
        .limit(4);
      if (posts) setRecentPosts(posts);

      const { data: docs } = await supabase
        .from('documents')
        .select('id, file_name, category, created_at, file_size')
        .order('created_at', { ascending: false })
        .limit(4);
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
    <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-8 py-8 flex flex-col gap-8">
      
      {/* ========================================================
          1. TOP HERO: 중앙 집중형 스마트 검색 헤더
      ======================================================== */}
      <section className="flex flex-col items-center text-center pt-3 pb-2">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 mb-4 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-900">AI-SEN v4.9.2 엔진 가동중</span>
          <span className="text-slate-300">|</span>
          <Fuel size={16} className="text-amber-500" />
          <span className="text-slate-700 font-medium">오피넷 실시간 유가 1일 6회 연동</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-snug">
          교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-2 font-medium max-w-[700px] leading-relaxed">
          102권 공식 지침서 1:1 쪽수 앵커링 RAG 챗봇과 카카오·오피넷 실시간 연동 스마트 여비정산기
        </p>

        {/* Wide Omnibar Search Box */}
        <div className="w-full max-w-[880px] mt-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 교육행정 지침(수의계약, 강사료, 복무 등)이나 출장비, 서식을 검색하세요..."
              className="w-full bg-white text-slate-900 border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-2xl pl-14 pr-36 py-4 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm font-medium"
            />
            <button 
              type="submit" 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 btn-primary py-2.5 px-5 text-sm sm:text-base font-bold shadow-xs"
            >
              <span>질의하기</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Recommended Chips (Inline Subtle Text) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            <span className="text-xs sm:text-sm text-slate-400 font-bold">추천:</span>
            {QUICK_SEARCH_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="text-xs sm:text-sm px-3.5 py-1 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 font-semibold transition-colors shadow-xs"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* ========================================================
          2. CORE 4 SERVICES: 가로 4분할 1열 인터랙티브 퀵 카드
      ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CARD 1: 스마트 여비정산기 */}
        <a 
          href="https://chatbot.aisen.store/travel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-6 flex flex-col justify-between group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Navigation size={24} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  v4.9.2
                </span>
                <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              스마트 여비정산기
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
              카카오 3개 경유지 길찾기와 오피넷 유가 연동 출장비 자동 산출 및 A4 공문서 인쇄
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-sm text-blue-600 font-bold">
            <span>정산기 바로가기</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 2: 3-Tier AI 챗봇 */}
        <a 
          href="https://chatbot.aisen.store" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-6 flex flex-col justify-between group hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <Bot size={24} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  3-Tier
                </span>
                <ArrowUpRight size={18} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              AI 행정 챗봇
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
              28개 서고 지침서 100% 원본 쪽수 뷰어(#page=N) 및 국가법령센터 조문 실시간 연동
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-sm text-indigo-600 font-bold">
            <span>AI 질의하기</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 3: 행정 자료실 */}
        <Link 
          href="/archive" 
          className="glass-card p-6 flex flex-col justify-between group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <FolderOpen size={24} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                  102권 서고
                </span>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              행정 자료실 &amp; 지침서
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
              28개 분야 102권 공식 지침서 1:1 스트리밍 및 학교 실무 서식 통합 다운로드
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-sm text-emerald-600 font-bold">
            <span>자료실 바로가기</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* CARD 4: 업무 소통 게시판 */}
        <Link 
          href="/board" 
          className="glass-card p-6 flex flex-col justify-between group hover:border-sky-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
                <MessageSquareShare size={24} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
                  미가입 작성
                </span>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              업무 소통 게시판
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
              가입 없이 닉네임과 4자리 비밀번호로 자유롭게 실무 질의와 노하우 공유
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-sm text-sky-600 font-bold">
            <span>게시판 바로가기</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </section>

      {/* ========================================================
          3. REAL-TIME FEEDS: 실무 중심 2-Column 대시보드
      ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest Posts Feed */}
        <div className="glass-panel p-6 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-slate-900">
              <MessageSquareShare size={20} className="text-blue-600" />
              <span>최신 공지 및 업무 공유</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/board" className="text-sm text-slate-500 hover:text-blue-600 font-bold">
                더보기 &rarr;
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link 
                  key={post.id} 
                  href="/board" 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 text-sm sm:text-base group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold shrink-0">
                      {post.category || '공지'}
                    </span>
                    <span className="text-slate-800 font-semibold truncate group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400 shrink-0 ml-2">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-slate-400">등록된 게시물이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Latest Docs Feed */}
        <div className="glass-panel p-6 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-slate-900">
              <FileCheck2 size={20} className="text-emerald-600" />
              <span>최신 등록 서식 문서</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/archive" className="text-sm text-slate-500 hover:text-emerald-600 font-bold">
                더보기 &rarr;
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentDocs.length > 0 ? (
              recentDocs.map((doc) => (
                <Link 
                  key={doc.id} 
                  href="/archive" 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 text-sm sm:text-base group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold shrink-0">
                      {doc.category || '서식'}
                    </span>
                    <span className="text-slate-800 font-semibold truncate group-hover:text-emerald-600 transition-colors">
                      {doc.file_name}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400 shrink-0 ml-2">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-slate-400">등록된 서식이 없습니다.</div>
            )}
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="w-full pt-6 pb-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div>
          <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-5 text-slate-600 font-semibold">
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
