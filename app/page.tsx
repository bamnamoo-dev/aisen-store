'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Bot, 
  Navigation, 
  Search, 
  ChevronRight, 
  Fuel, 
  ArrowRight,
  ArrowUpRight,
  MessageSquareShare,
  FolderOpen,
  LayoutDashboard,
  Tag,
  LayoutGrid,
  FileSpreadsheet,
  UtensilsCrossed,
  Calculator,
  Flame,
  FileCheck,
  ChartPie
} from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.open(`https://chatbot.aisen.store?q=${encodeURIComponent(searchQuery.trim())}`, '_blank');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-5 sm:py-7 flex flex-col min-h-screen gap-3">
      
      {/* ========================================================
          1. TOP HERO: 컴팩트 스마트 검색 헤더
      ======================================================== */}
      <section className="flex flex-col items-center text-center">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-700 mb-2 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-900">AI-SEN v4.9.2 엔진 가동중</span>
          <span className="text-slate-300">|</span>
          <Fuel size={12} className="text-amber-500" />
          <span className="text-slate-600 font-medium">오피넷 실시간 유가 1일 6회 자동 연동</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-[36px] font-black text-slate-900 tracking-tight leading-tight">
          교육행정의 모든 기준과 계산, <span className="text-blue-600">AI-SEN</span>
        </h1>
        <p className="text-[15.5px] text-slate-500 mt-1.5 font-medium max-w-[680px]">
          102권 공식 지침서 1:1 쪽수 앵커링 RAG 챗봇과 카카오·오피넷 실시간 연동 스마트 여비정산기
        </p>

        {/* Compact Omnibar Search Box */}
        <div className="w-full max-w-[760px] mt-2.5">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 교육행정 지침(수의계약, 강사료, 복무 등)이나 출장비, 서식을 검색하세요..."
              className="w-full bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-xl pl-11 pr-24 py-2 text-xs sm:text-[13.5px] focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all shadow-2xs font-medium"
            />
            <button 
              type="submit" 
              className="absolute right-1.5 btn-primary py-1.5 px-3.5 text-xs font-bold shadow-2xs rounded-lg gap-1.5"
            >
              <span>질의하기</span>
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

      </section>

      {/* ========================================================
          2. CORE 12 SERVICES & MINI PROGRAMS GRID (4 x 3 그리드)
      ======================================================== */}
      <section className="w-full max-w-[1400px] mx-auto flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3" style={{gridAutoRows: '1fr'}}>
        
        {/* =========================================================================
            GROUP 1: AI & 스마트 포털 (인디고 / 스카이 / 블루)
        ========================================================================= */}
        
        {/* CARD 1: AI 행정 챗봇 (Indigo) */}
        <a 
          href="https://chatbot.aisen.store" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <Bot size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 whitespace-nowrap">
                  3-Tier
                </span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              AI 행정 챗봇
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              102권 서고 지침서 1:1 쪽수 뷰어 및 국가법령 연동
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-indigo-600 font-bold">
            <span>AI 질의하기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* CARD 2: 스마트 여비정산기 (Sky) */}
        <a 
          href="https://chatbot.aisen.store/travel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-sky-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
                <Navigation size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 whitespace-nowrap">
                  v4.9.2
                </span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
              스마트 여비정산기
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              카카오 3개 경유지 및 오피넷 실시간 유가 연동 산출
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-sky-600 font-bold">
            <span>정산기 열기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* CARD 3: 업무 소통 게시판 (Blue) */}
        <Link 
          href="/board" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <MessageSquareShare size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 whitespace-nowrap">
                  미가입
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              소통 게시판
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              가입 없이 4자리 암호로 자유로운 실무 질의 및 공유
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-blue-600 font-bold">
            <span>게시판 가기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* =========================================================================
            GROUP 2: 회계 & 예산 정산 (틸 / 에메랄드 / 사이언)
        ========================================================================= */}

        {/* CARD 4: 학교회계 대시보드 (Teal) */}
        <Link 
          href="/tools/sfd" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-teal-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform">
                <LayoutDashboard size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 whitespace-nowrap">
                  2026 베타
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
              학교회계 대시보드
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              세부사업·추경·지출집행 실시간 모니터링 분석
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-teal-600 font-bold">
            <span>대시보드 열기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 5: 예산정산 대시보드 (Emerald) */}
        <Link 
          href="/tools/budget-settle" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <ChartPie size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
                  세입세출 정산
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
              예산정산 대시보드
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              수익자부담·목적사업비 세입세출 정산 및 잔액 분석
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-emerald-600 font-bold">
            <span>정산 분석</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 6: 체육관 사용료 계산기 (Cyan) */}
        <Link 
          href="/tools/gym-calc" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 group-hover:scale-105 transition-transform">
                <Calculator size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 whitespace-nowrap">
                  조례 자동산출
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-cyan-600 transition-colors truncate">
              체육관 사용료
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              시설개방 조례 기준 대관료 및 냉난방비 자동 산출
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-cyan-600 font-bold">
            <span>사용료 계산</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* =========================================================================
            GROUP 3: 인사 / 서식 / 엑셀 실무 (앰버 / 그린 / 에메랄드 / 오렌지)
        ========================================================================= */}

        {/* CARD 7: 행정·민원 서식 68종 (Amber) */}
        <a 
          href="https://chatbot.aisen.store?forms=1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-amber-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <FileCheck size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 whitespace-nowrap">
                  68종
                </span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
              행정·민원 서식
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              인사·복무 및 제증명 서식 실시간 미리보기 및 HWP 다운
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-amber-600 font-bold">
            <span>서식 포털</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* CARD 8: 행정 자료실 (Green) */}
        <Link 
          href="/archive" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-green-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 group-hover:scale-105 transition-transform">
                <FolderOpen size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200 whitespace-nowrap">
                  102권
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-green-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-green-600 transition-colors truncate">
              행정 자료실
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              28개 분야 102권 공식 지침서 스트리밍 서고
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-green-600 font-bold">
            <span>자료실 보기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 9: 엑셀시트별 분리저장기 (Emerald) */}
        <Link 
          href="/tools/sheet-splitter" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <FileSpreadsheet size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
                  초고속 분리
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              엑셀시트 분리기
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              엑셀 파일 내 개별 시트를 단일 파일로 일괄 분리·저장
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-emerald-700 font-bold">
            <span>시트 분리하기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 10: 나이스 임금대장 식대 분리기 (Orange) */}
        <Link 
          href="/tools/sikdae" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-orange-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:scale-105 transition-transform">
                <UtensilsCrossed size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 whitespace-nowrap">
                  급식비 보안
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
              임금대장 식대분리
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              나이스 임금대장 (이름-식대) 공제내역 간편 추출
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-orange-600 font-bold">
            <span>공제내역 추출</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* =========================================================================
            GROUP 4: 시설 관리 & 힐링 (바이올렛 / 퍼플 / 로즈)
        ========================================================================= */}

        {/* CARD 11: 증빙서 측면표지 제작기 (Violet) */}
        <Link 
          href="/tools/label-maker" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-violet-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
                <Tag size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200 whitespace-nowrap">
                  라벨출력
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-violet-600 transition-colors truncate">
              증빙서 측면표지
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              지출증빙서 측면 라벨 양식 자동 생성 및 규격 인쇄
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-violet-600 font-bold">
            <span>표지 만들기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 12: 교실배치도 제작기 (Purple) */}
        <Link 
          href="/tools/classmap" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-purple-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
                <LayoutGrid size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 whitespace-nowrap">
                  도면제작
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
              교실배치도 제작기
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              층별·특별실 교실배치도 시각화 및 직관적 도면 생성
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-purple-600 font-bold">
            <span>배치도 제작</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 13: 수박 게임 (Rose) */}
        <Link 
          href="/tools/watermelon" 
          className="glass-card p-3.5 flex flex-col justify-between h-[145px] group hover:border-rose-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform text-lg">
                🍉
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 whitespace-nowrap">
                  랭킹 게임
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
              수박 게임
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              3D 벡터 과일 합치기 &amp; 실시간 글로벌 랭킹 게임
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-rose-600 font-bold">
            <span>게임 시작</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

      </section>

      {/* ========================================================
          3. COMPACT FOOTER
      ======================================================== */}
      <footer className="w-full pt-2.5 pb-1 border-t border-slate-200 flex items-center justify-center text-[10.5px] sm:text-xs text-slate-400 font-medium">
        <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
      </footer>

    </div>
  );
}

