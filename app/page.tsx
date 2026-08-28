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
  FolderOpen,
  FileSpreadsheet,
  LayoutDashboard,
  Tag,
  Calculator,
  Grid,
  UtensilsCrossed,
  Sparkles
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
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col justify-between min-h-[calc(100vh-2rem)] gap-4 sm:gap-5">
      
      {/* ========================================================
          1. TOP HERO: 컴팩트 스마트 검색 헤더
      ======================================================== */}
      <section className="flex flex-col items-center text-center">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] sm:text-xs text-slate-700 mb-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-900">AI-SEN v4.9.2 엔진 가동중</span>
          <span className="text-slate-300">|</span>
          <Fuel size={13} className="text-amber-500" />
          <span className="text-slate-600 font-medium">오피넷 실시간 유가 1일 6회 자동 연동</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-[34px] font-black text-slate-900 tracking-tight leading-tight">
          교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium max-w-[680px]">
          102권 공식 지침서 1:1 쪽수 앵커링 RAG 챗봇과 카카오·오피넷 실시간 연동 스마트 여비정산기
        </p>

        {/* Compact Omnibar Search Box */}
        <div className="w-full max-w-[780px] mt-3">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400 pointer-events-none" size={19} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 교육행정 지침(수의계약, 강사료, 복무 등)이나 출장비, 서식을 검색하세요..."
              className="w-full bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-xl pl-11 pr-28 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all shadow-xs font-medium"
            />
            <button 
              type="submit" 
              className="absolute right-1.5 btn-primary py-1.5 sm:py-2 px-3.5 sm:px-4 text-xs font-bold shadow-xs rounded-lg gap-1.5"
            >
              <span>질의하기</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Recommended Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2">
            <span className="text-[11px] sm:text-xs text-slate-400 font-bold mr-0.5">추천 질문:</span>
            {QUICK_SEARCH_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 font-medium transition-all shadow-2xs"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* ========================================================
          2. CORE 12 SERVICES & MINI PROGRAMS GRID (6 x 2 그리드)
      ======================================================== */}
      <section className="flex flex-col gap-3">
        
        {/* ROW 1: AI 핵심 솔루션 & 주요 포털 (6개) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          
          {/* CARD 1: AI 행정 챗봇 */}
          <a 
            href="https://chatbot.aisen.store" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                  <Bot size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    3-Tier
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                AI 행정 챗봇
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                102권 서고 지침서 1:1 쪽수 뷰어 및 국가법령 연동
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-bold">
              <span>AI 질의하기</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* CARD 2: 스마트 여비정산기 */}
          <a 
            href="https://chatbot.aisen.store/travel" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                  <Navigation size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    v4.9.2
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                스마트 여비정산기
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                카카오 3개 경유지 및 오피넷 실시간 유가 연동 산출
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-bold">
              <span>정산기 열기</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* CARD 3: 행정 자료실 */}
          <Link 
            href="/archive" 
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                  <FolderOpen size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    102권
                  </span>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                행정 자료실
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                28개 분야 102권 공식 지침서 스트리밍 서고
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-bold">
              <span>자료실 보기</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* CARD 4: 소통 게시판 */}
          <Link 
            href="/board" 
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-sky-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
                  <MessageSquareShare size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                    미가입
                  </span>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                소통 게시판
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                가입 없이 4자리 암호로 자유로운 실무 질의 및 공유
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-sky-600 font-bold">
              <span>게시판 가기</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* CARD 5: 행정·민원 서식 포털 */}
          <a 
            href="https://chatbot.aisen.store?forms=1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-amber-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                  <FileCheck2 size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    68종
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                행정·민원 서식
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                인사·복무 및 제증명 서식 1:1 미리보기 및 HWP 다운
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-600 font-bold">
              <span>서식 포털</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* CARD 6: 수박 게임 */}
          <a 
            href="https://project-np0t7.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-rose-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform text-lg">
                  🍉
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                    랭킹 게임
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                수박 게임
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                3D 벡터 과일 합치기 &amp; 실시간 글로벌 랭킹 게임
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-rose-600 font-bold">
              <span>게임 시작</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

        </div>

        {/* ROW 2: 행정 미니 프로그램 6종 (6개) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          
          {/* MINI CARD 1: 증빙서 측면표지 제작기 */}
          <a 
            href="https://label-maker-two.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-violet-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
                  <Tag size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100">
                    라벨출력
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-violet-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors truncate">
                증빙서 측면표지
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                지출증빙서 측면 라벨 양식 자동 생성 및 규격 인쇄
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-violet-600 font-bold">
              <span>표지 만들기</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* MINI CARD 2: 학교회계 통합 대시보드 */}
          <a 
            href="https://bamnamoo-dev.github.io/SFD/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-teal-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform">
                  <LayoutDashboard size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                    2026 베타
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                학교회계 대시보드
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                세부사업·추경·지출집행 실시간 모니터링 분석
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-600 font-bold">
              <span>대시보드 열기</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* MINI CARD 3: 엑셀시트별 분리저장기 */}
          <a 
            href="https://sen-excel-splitter.streamlit.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    엑셀분리
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                엑셀시트 분리기
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                엑셀 파일 내 개별 시트를 단일 파일로 일괄 분리·저장
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
              <span>시트 분리하기</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* MINI CARD 4: 나이스 임금대장 식대 분리기 */}
          <a 
            href="https://sikdae.streamlit.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-orange-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                    급식비
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                임금대장 식대분리
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                나이스 임금대장 (이름-식대) 공제내역 간편 추출
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-orange-600 font-bold">
              <span>공제내역 추출</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* MINI CARD 5: 교실배치도 제작기 */}
          <a 
            href="https://bamnamoo-dev.github.io/classmap/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 group-hover:scale-105 transition-transform">
                  <Grid size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
                    도면제작
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors truncate">
                교실배치도 제작기
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                층별·특별실 교실배치도 시각화 및 직관적 도면 생성
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-cyan-600 font-bold">
              <span>배치도 제작</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* MINI CARD 6: 체육관 사용료 계산기 */}
          <a 
            href="https://bamnamoo-dev.github.io/gym/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-3 sm:p-3.5 flex flex-col justify-between min-h-[142px] group hover:border-pink-400 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 group-hover:scale-105 transition-transform">
                  <Calculator size={18} />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100">
                    사용료
                  </span>
                  <ArrowUpRight size={13} className="text-slate-400 group-hover:text-pink-600 transition-colors" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors truncate">
                체육관 사용료
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                시설개방 조례 기준 대관료 및 냉난방비 자동 산출
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-pink-600 font-bold">
              <span>사용료 계산</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

        </div>

      </section>

      {/* ========================================================
          3. COMPACT FOOTER
      ======================================================== */}
      <footer className="w-full pt-2 pb-1 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-400">
        <div>
          <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-slate-500 font-semibold">
          <a href="https://chatbot.aisen.store" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">AI 챗봇</a>
          <Link href="/chatbot" className="hover:text-blue-600">구글 챗봇</Link>
          <a href="https://chatbot.aisen.store/travel" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">여비정산기</a>
          <Link href="/archive" className="hover:text-blue-600">자료실</Link>
          <Link href="/tools" className="hover:text-blue-600">미니프로그램</Link>
          <a href="https://chatbot.aisen.store?forms=1" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600">행정서식</a>
          <Link href="/board" className="hover:text-blue-600">게시판</Link>
          <a href="https://project-np0t7.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600">수박게임</a>
        </div>
      </footer>

    </div>
  );
}

