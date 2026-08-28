'use client';

import Link from 'next/link';
import { useState } from 'react';
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

const QUICK_SEARCH_CHIPS = [
  { icon: '🚗', label: '관내 출장비 계산', query: '관내 출장 여비 지급 기준 및 산출 방법' },
  { icon: '📄', label: '1인 견적 수의계약 한도', query: '1인 견적 수의계약 체결 가능 금액 한도' },
  { icon: '🍱', label: '방과후 강사료 기준', query: '방과후학교 강사료 지급 기준 및 원천징수' },
  { icon: '📜', label: '학교회계 규칙 조문', query: '공립학교회계 규칙 예산 및 지출 관련 조항' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.open(`https://chatbot.aisen.store?q=${encodeURIComponent(searchQuery.trim())}`, '_blank');
  };

  const handleChipClick = (query: string) => {
    window.open(`https://chatbot.aisen.store?q=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 py-8 sm:py-12 flex flex-col justify-center min-h-[calc(100vh-4rem)] gap-10">
      
      {/* ========================================================
          1. TOP HERO: 대형 볼드 스마트 검색 헤더
      ======================================================== */}
      <section className="flex flex-col items-center text-center pt-2">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 mb-4 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-900">AI-SEN v4.9.2 엔진 가동중</span>
          <span className="text-slate-300">|</span>
          <Fuel size={16} className="text-amber-500" />
          <span className="text-slate-700 font-medium">오피넷 실시간 유가 1일 6회 자동 연동</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-3.5xl sm:text-4.5xl md:text-[48px] font-black text-slate-900 tracking-tight leading-tight">
          교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 mt-2.5 font-medium max-w-[720px] leading-relaxed">
          102권 공식 지침서 1:1 쪽수 앵커링 RAG 챗봇과 카카오·오피넷 실시간 연동 스마트 여비정산기
        </p>

        {/* Wide Omnibar Search Box */}
        <div className="w-full max-w-[880px] mt-6">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-5 text-slate-400 pointer-events-none" size={24} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 교육행정 지침(수의계약, 강사료, 복무 등)이나 출장비, 서식을 검색하세요..."
              className="w-full bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-2xl pl-14 pr-36 py-4 sm:py-5 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm font-medium"
            />
            <button 
              type="submit" 
              className="absolute right-2.5 btn-primary py-3 px-6 text-base font-bold shadow-xs rounded-xl"
            >
              <span>질의하기</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Recommended Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            <span className="text-xs sm:text-sm text-slate-400 font-bold mr-1">추천 질문:</span>
            {QUICK_SEARCH_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3.5 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 font-semibold transition-all shadow-xs"
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
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* CARD 1: AI 행정 챗봇 */}
        <a 
          href="https://chatbot.aisen.store" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4.5 flex flex-col justify-between min-h-[190px] group hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <Bot size={22} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  3-Tier
                </span>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              AI 행정 챗봇
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              102권 서고 지침서 1:1 쪽수 뷰어 및 국가법령 연동
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-indigo-600 font-bold">
            <span>AI 질의하기</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 2: 스마트 여비정산기 */}
        <a 
          href="https://chatbot.aisen.store/travel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4.5 flex flex-col justify-between min-h-[190px] group hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Navigation size={22} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  v4.9.2
                </span>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              스마트 여비정산기
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              카카오 3개 경유지 및 오피넷 실시간 유가 연동 산출
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-blue-600 font-bold">
            <span>정산기 열기</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 3: 행정 자료실 */}
        <Link 
          href="/archive" 
          className="glass-card p-4.5 flex flex-col justify-between min-h-[190px] group hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <FolderOpen size={22} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  102권
                </span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
              행정 자료실
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              28개 분야 102권 공식 지침서 스트리밍 서고
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-emerald-600 font-bold">
            <span>자료실 보기</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* CARD 4: 업무 소통 게시판 */}
        <Link 
          href="/board" 
          className="glass-card p-4.5 flex flex-col justify-between min-h-[190px] group hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
                <MessageSquareShare size={22} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  미가입
                </span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
              소통 게시판
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              가입 없이 4자리 암호로 자유로운 실무 질의 및 공유
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-sky-600 font-bold">
            <span>게시판 가기</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* CARD 5: 행정·민원 서식 포털 (챗봇 프로그램) */}
        <a 
          href="https://chatbot.aisen.store?forms=1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4.5 flex flex-col justify-between min-h-[190px] group hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <FileCheck2 size={22} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  68종
                </span>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
              행정·민원 서식
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              인사·복무 및 제증명 서식 1:1 미리보기 및 HWP 다운
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-amber-600 font-bold">
            <span>서식 포털</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* CARD 6: 수박 게임 */}
        <a 
          href="https://suikagame.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4.5 flex flex-col justify-between min-h-[190px] group hover:border-rose-400 hover:shadow-lg transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform">
                <span className="text-2xl leading-none">🍉</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                  쉼터
                </span>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
              수박 게임
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              업무 중 잠시 쉬어가는 힐링 수박 합치기 미니 게임
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-rose-600 font-bold">
            <span>게임 시작</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

      </section>

      {/* Footer */}
      <footer className="w-full pt-4 pb-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-400">
        <div>
          <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-slate-500 font-semibold">
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
