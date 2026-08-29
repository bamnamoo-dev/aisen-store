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
  UtensilsCrossed
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
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col justify-between min-h-[calc(100vh-1rem)] gap-4 sm:gap-6">
      
      {/* ========================================================
          1. TOP HERO: 컴팩트 스마트 검색 헤더
      ======================================================== */}
      <section className="flex flex-col items-center text-center">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs sm:text-[13px] text-slate-700 mb-3 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-900">AI-SEN v4.9.2 엔진 가동중</span>
          <span className="text-slate-300">|</span>
          <Fuel size={14} className="text-amber-500" />
          <span className="text-slate-600 font-medium">오피넷 실시간 유가 1일 6회 자동 연동</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3.5xl md:text-[36px] font-black text-slate-900 tracking-tight leading-tight">
          교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
        </h1>
        <p className="text-xs sm:text-[14.5px] text-slate-500 mt-1.5 font-medium max-w-[680px]">
          102권 공식 지침서 1:1 쪽수 앵커링 RAG 챗봇과 카카오·오피넷 실시간 연동 스마트 여비정산기
        </p>

        {/* Compact Omnibar Search Box */}
        <div className="w-full max-w-[760px] mt-3.5">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400 pointer-events-none" size={20} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 교육행정 지침(수의계약, 강사료, 복무 등)이나 출장비, 서식을 검색하세요..."
              className="w-full bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-xl pl-12 pr-28 py-2.5 sm:py-3 text-xs sm:text-[14.5px] focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all shadow-2xs font-medium"
            />
            <button 
              type="submit" 
              className="absolute right-1.5 btn-primary py-2 px-4 text-xs sm:text-[13px] font-bold shadow-2xs rounded-lg gap-1.5"
            >
              <span>질의하기</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Recommended Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2.5">
            <span className="text-xs text-slate-400 font-bold mr-0.5">추천 질문:</span>
            {QUICK_SEARCH_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 font-medium transition-all shadow-2xs"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* ========================================================
          2. CORE 12 SERVICES & MINI PROGRAMS GRID (4 x 3 그리드)
      ======================================================== */}
      <section className="w-full max-w-[1240px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* ROW 1: AI 핵심 솔루션 & 핵심 플랫폼 */}
        
        {/* CARD 1: AI 행정 챗봇 */}
        <a 
          href="https://chatbot.aisen.store" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <Bot size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 whitespace-nowrap">
                  3-Tier
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              AI 행정 챗봇
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              102권 서고 지침서 1:1 쪽수 뷰어 및 국가법령 연동
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-indigo-600 font-bold">
            <span>AI 질의하기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* CARD 2: 스마트 여비정산기 */}
        <a 
          href="https://chatbot.aisen.store/travel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Navigation size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 whitespace-nowrap">
                  v4.9.2
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              스마트 여비정산기
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              카카오 3개 경유지 및 오피넷 실시간 유가 연동 산출
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-blue-600 font-bold">
            <span>정산기 열기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* CARD 3: 행정·민원 서식 */}
        <a 
          href="https://chatbot.aisen.store?forms=1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-amber-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <FileCheck2 size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 whitespace-nowrap">
                  68종
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
              행정·민원 서식
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              인사·복무 및 제증명 서식 실시간 미리보기 및 HWP 다운
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-amber-600 font-bold">
            <span>서식 포털</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* CARD 4: 학교회계 통합 대시보드 */}
        <a 
          href="https://bamnamoo-dev.github.io/SFD/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-teal-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform">
                <LayoutDashboard size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 whitespace-nowrap">
                  2026 베타
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
              학교회계 대시보드
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              세부사업·추경·지출집행 실시간 모니터링 분석
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-teal-600 font-bold">
            <span>대시보드 열기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* ROW 2: 자료 서고, 소통, 서식 제작 도구 */}

        {/* CARD 5: 행정 자료실 */}
        <Link 
          href="/archive" 
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <FolderOpen size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 whitespace-nowrap">
                  102권
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
              행정 자료실
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              28개 분야 102권 공식 지침서 스트리밍 서고
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-emerald-600 font-bold">
            <span>자료실 보기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 6: 소통 게시판 */}
        <Link 
          href="/board" 
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-sky-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
                <MessageSquareShare size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 whitespace-nowrap">
                  미가입
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
              소통 게시판
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              가입 없이 4자리 암호로 자유로운 실무 질의 및 공유
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-sky-600 font-bold">
            <span>게시판 가기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 7: 증빙서 측면표지 제작기 (내장형 라우트) */}
        <Link 
          href="/tools/label-maker" 
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-violet-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
                <Tag size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 whitespace-nowrap">
                  라벨출력
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-violet-600 transition-colors truncate">
              증빙서 측면표지
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              지출증빙서 측면 라벨 양식 자동 생성 및 규격 인쇄
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-violet-600 font-bold">
            <span>표지 만들기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 8: 교실배치도 제작기 */}
        <a 
          href="https://bamnamoo-dev.github.io/classmap/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 group-hover:scale-105 transition-transform">
                <Grid size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100 whitespace-nowrap">
                  도면제작
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-cyan-600 transition-colors truncate">
              교실배치도 제작기
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              층별·특별실 교실배치도 시각화 및 직관적 도면 생성
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-cyan-600 font-bold">
            <span>배치도 제작</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* ROW 3: 데이터 처리 도구 & 계산기 & 엔터테인먼트 */}

        {/* CARD 9: 엑셀시트별 분리저장기 (내장형 라우트) */}
        <Link 
          href="/tools/sheet-splitter" 
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <FileSpreadsheet size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 whitespace-nowrap">
                  초고속 분리
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              엑셀시트 분리기
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              엑셀 파일 내 개별 시트를 단일 파일로 일괄 분리·저장
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-emerald-700 font-bold">
            <span>시트 분리하기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 10: 나이스 임금대장 식대 분리기 (내장형 라우트) */}
        <Link 
          href="/tools/sikdae" 
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-orange-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:scale-105 transition-transform">
                <UtensilsCrossed size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 whitespace-nowrap">
                  급식비 보안
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
              임금대장 식대분리
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              나이스 임금대장 (이름-식대) 공제내역 간편 추출
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-orange-600 font-bold">
            <span>공제내역 추출</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 11: 체육관 사용료 계산기 (내장형 라우트) */}
        <Link 
          href="/tools/gym-calc" 
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-pink-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 group-hover:scale-105 transition-transform">
                <Calculator size={19} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100 whitespace-nowrap">
                  조례 자동산출
                </span>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-pink-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-pink-600 transition-colors truncate">
              체육관 사용료
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              시설개방 조례 기준 대관료 및 냉난방비 자동 산출
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-pink-600 font-bold">
            <span>사용료 계산</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 12: 수박 게임 */}
        <a 
          href="https://project-np0t7.vercel.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-4 flex flex-col justify-between h-[150px] group hover:border-rose-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform text-lg">
                🍉
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 whitespace-nowrap">
                  랭킹 게임
                </span>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
              수박 게임
            </h2>
            <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-1 font-medium">
              3D 벡터 과일 합치기 &amp; 실시간 글로벌 랭킹 게임
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-rose-600 font-bold">
            <span>게임 시작</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

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

