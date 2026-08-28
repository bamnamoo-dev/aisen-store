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
  FolderOpen,
  FileText,
  MessageSquare,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const QUICK_SEARCH_CHIPS = [
  { icon: '🚗', label: '관내 출장비 계산', query: '관내 출장 여비 지급 기준 및 산출 방법' },
  { icon: '📄', label: '1인 견적 수의계약 한도', query: '1인 견적 수의계약 체결 가능 금액 한도' },
  { icon: '🍱', label: '방과후 강사료 기준', query: '방과후학교 강사료 지급 기준 및 원천징수' },
  { icon: '📜', label: '학교회계 규칙 조문', query: '공립학교회계 규칙 예산 및 지출 관련 조항' },
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
    <div className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 py-4 sm:py-6 flex flex-col gap-5">
      
      {/* ========================================================
          1. TOP HERO: 대형 볼드 스마트 검색 헤더
      ======================================================== */}
      <section className="flex flex-col items-center text-center pt-1 pb-1">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 mb-3 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-900">AI-SEN v4.9.2 엔진 가동중</span>
          <span className="text-slate-300">|</span>
          <Fuel size={15} className="text-amber-500" />
          <span className="text-slate-700 font-medium">오피넷 실시간 유가 1일 6회 자동 연동</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-[42px] font-black text-slate-900 tracking-tight leading-tight">
          교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1.5 font-medium max-w-[680px] leading-relaxed">
          102권 공식 지침서 1:1 쪽수 앵커링 RAG 챗봇과 카카오·오피넷 실시간 연동 스마트 여비정산기
        </p>

        {/* Wide Omnibar Search Box */}
        <div className="w-full max-w-[860px] mt-4">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-5 text-slate-400 pointer-events-none" size={22} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 교육행정 지침(수의계약, 강사료, 복무 등)이나 출장비, 서식을 검색하세요..."
              className="w-full bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-2xl pl-13 pr-34 py-3.5 sm:py-4 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm font-medium"
            />
            <button 
              type="submit" 
              className="absolute right-2 btn-primary py-2.5 px-5 text-sm sm:text-base font-bold shadow-xs rounded-xl"
            >
              <span>질의하기</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Quick Recommended Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <span className="text-xs sm:text-sm text-slate-400 font-bold mr-1">추천 질문:</span>
            {QUICK_SEARCH_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="inline-flex items-center gap-1 text-xs sm:text-sm px-3 py-1 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 font-semibold transition-all shadow-xs"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* ========================================================
          2. CORE 6 SERVICES: 세로형 6분할 인터랙티브 카드 (단일 열)
      ======================================================== */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* CARD 1: AI 행정 챗봇 */}
        <a 
          href="https://chatbot.aisen.store" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between min-h-[175px] group hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <Bot size={20} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                  3-Tier
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15px] sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              AI 행정 챗봇
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              102권 서고 지침서 1:1 쪽수 뷰어 및 법령 연동
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
            <span>AI 질의하기</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 2: 스마트 여비정산기 */}
        <a 
          href="https://chatbot.aisen.store/travel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between min-h-[175px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Navigation size={20} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                  v4.9.2
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15px] sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              스마트 여비정산기
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              카카오 3개 경유지 및 오피넷 유가 연동 출장비 산출
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
            <span>정산기 열기</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 3: 행정 자료실 */}
        <Link 
          href="/archive" 
          className="glass-card p-4 flex flex-col justify-between min-h-[175px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <FolderOpen size={20} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                  102권
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15px] sm:text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
              행정 자료실
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              28개 분야 102권 공식 지침서 스트리밍 서고
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>자료실 보기</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* CARD 4: 업무 소통 게시판 */}
        <Link 
          href="/board" 
          className="glass-card p-4 flex flex-col justify-between min-h-[175px] group hover:border-sky-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
                <MessageSquareShare size={20} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100">
                  미가입
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15px] sm:text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
              소통 게시판
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              가입 없이 4자리 암호로 자유로운 실무 질의
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-bold">
            <span>게시판 가기</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* CARD 5: 행정·민원 서식 포털 (챗봇 프로그램) */}
        <a 
          href="https://chatbot.aisen.store?forms=1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between min-h-[175px] group hover:border-amber-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <FileCheck2 size={20} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                  68종
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15px] sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
              행정·민원 서식
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              인사·복무 및 제증명 서식 1:1 미리보기 및 HWP 다운
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
            <span>서식 포털</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 6: 수박 게임 */}
        <a 
          href="https://suikagame.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between min-h-[175px] group hover:border-rose-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform">
                <span className="text-xl leading-none">🍉</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                  쉼터
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15px] sm:text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
              수박 게임
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              업무 중 잠시 쉬어가는 힐링 수박 합치기 미니 게임
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold">
            <span>게임 시작</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

      </section>

      {/* ========================================================
          3. REAL-TIME FEEDS: 독립 카드형 2-Column 대시보드
      ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
        
        {/* Left Column: 최신 공지 및 업무 공유 */}
        <div className="glass-panel p-4.5 sm:p-5 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-slate-900">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <MessageSquare size={17} />
                </div>
                <span>최신 공지 및 업무 공유</span>
              </div>
              <Link href="/board" className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 font-bold flex items-center gap-0.5 transition-colors">
                <span>더보기</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Individual Card Items */}
            <div className="flex flex-col gap-2">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    href="/board" 
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white hover:bg-blue-50/50 transition-all border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100 shrink-0">
                        {post.category || '공지'}
                      </span>
                      <span className="text-slate-800 font-bold truncate text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-5 text-center text-xs sm:text-sm text-slate-400">등록된 게시물이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 최신 등록 서식 문서 */}
        <div className="glass-panel p-4.5 sm:p-5 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-slate-900">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <FileText size={17} />
                </div>
                <span>최신 등록 서식 문서</span>
              </div>
              <Link href="/archive" className="text-xs sm:text-sm text-slate-500 hover:text-emerald-600 font-bold flex items-center gap-0.5 transition-colors">
                <span>더보기</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Individual Card Items */}
            <div className="flex flex-col gap-2">
              {recentDocs.length > 0 ? (
                recentDocs.map((doc) => (
                  <Link 
                    key={doc.id} 
                    href="/archive" 
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white hover:bg-emerald-50/50 transition-all border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shrink-0">
                        {doc.category || '서식'}
                      </span>
                      <span className="text-slate-800 font-bold truncate text-xs sm:text-sm group-hover:text-emerald-600 transition-colors">
                        {doc.file_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-5 text-center text-xs sm:text-sm text-slate-400">등록된 서식이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="w-full pt-3 pb-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-400">
        <div>
          <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 text-slate-500 font-semibold">
          <a href="https://chatbot.aisen.store" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">AI 챗봇</a>
          <Link href="/chatbot" className="hover:text-blue-600">구글 챗봇</Link>
          <a href="https://chatbot.aisen.store/travel" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">여비정산기</a>
          <Link href="/archive" className="hover:text-blue-600">자료실</Link>
          <a href="https://chatbot.aisen.store?forms=1" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600">행정서식</a>
          <Link href="/board" className="hover:text-blue-600">게시판</Link>
          <a href="https://suikagame.com" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600">수박게임</a>
        </div>
      </footer>

    </div>
  );
}
