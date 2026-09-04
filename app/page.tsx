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
  ChartPie,
  ShieldCheck,
  Lock,
  Zap,
  HardDrive
} from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.open(`https://chatbot.aisen.store?q=${encodeURIComponent(searchQuery.trim())}`, '_blank');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 pt-2 sm:pt-3 pb-4 sm:pb-5 flex flex-col min-h-screen gap-2.5">
      
      {/* ========================================================
          1. TOP HERO: 대형 헤드라인 & 스마트 검색창
      ======================================================== */}
      <section className="flex flex-col items-center text-center pt-0 sm:pt-1">
        
        {/* Headline (대형 44px 폰트 & 그라데이션) */}
        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-black text-slate-900 tracking-tight leading-tight">
          교육행정의 모든 기준과 계산, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">AI-SEN</span>
        </h1>
        <p className="text-[14.5px] sm:text-[15.5px] text-slate-500 mt-2.5 font-medium max-w-[720px]">
          102권 공식 지침서 1:1 쪽수 앵커링 RAG 챗봇과 카카오·오피넷 실시간 연동 스마트 여비정산기
        </p>

        {/* Unified Search Omnibar Box */}
        <div className="w-full max-w-[800px] mt-4">
          <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-2xl border border-slate-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100/80 transition-all shadow-2xs hover:shadow-md">
            <Search className="absolute left-4 text-blue-500 pointer-events-none" size={19} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 교육행정 지침(수의계약, 강사료, 복무 등)이나 출장비, 서식을 검색하세요..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 pl-11 pr-28 py-2.5 sm:py-2.5 text-xs sm:text-[14px] focus:outline-none font-medium"
            />
            <button 
              type="submit" 
              className="absolute right-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-1.5 px-4 text-xs sm:text-[13px] font-bold shadow-xs hover:shadow-sm rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
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
            ROW 1: AI & 스마트 포털 허브 (Royal Blue Top Accent 🔵)
        ========================================================================= */}
        
        {/* CARD 1: AI 행정 챗봇 */}
        <a 
          href="https://chatbot.aisen.store" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-blue-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Bot size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 whitespace-nowrap">
                  3-Tier
                </span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              AI 행정 챗봇
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              102권 서고 지침서 1:1 쪽수 뷰어 및 국가법령 연동
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-blue-600 font-bold">
            <span>AI 질의하기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* CARD 2: 스마트 여비정산기 */}
        <a 
          href="https://chatbot.aisen.store/travel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-blue-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Navigation size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 whitespace-nowrap">
                  v4.9.2
                </span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              스마트 여비정산기
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              카카오 3개 경유지 및 오피넷 실시간 유가 연동 산출
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-blue-600 font-bold">
            <span>정산기 열기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* CARD 3: 업무 소통 게시판 */}
        <Link 
          href="/board" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-blue-600 group-hover:h-[5px] transition-all" />

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

        {/* CARD 4: 행정·민원 서식 68종 */}
        <a 
          href="https://chatbot.aisen.store?forms=1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-blue-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <FileCheck size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 whitespace-nowrap">
                  68종
                </span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              행정·민원 서식
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              인사·복무 및 제증명 서식 실시간 미리보기 및 HWP 다운
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-blue-600 font-bold">
            <span>서식 포털</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* =========================================================================
            ROW 2: 회계 & 예산 & 정산 (Emerald Green Top Accent 🟢)
        ========================================================================= */}

        {/* CARD 5: 학교회계 대시보드 */}
        <Link 
          href="/tools/sfd" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-emerald-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <LayoutDashboard size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
                  2026 베타
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
              학교회계 대시보드
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              세부사업·추경·지출집행 실시간 모니터링 분석
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-emerald-600 font-bold">
            <span>대시보드 열기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 6: 예산정산 대시보드 */}
        <Link 
          href="/tools/budget-settle" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-emerald-600 group-hover:h-[5px] transition-all" />

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

        {/* CARD 7: 엑셀시트별 분리저장기 */}
        <Link 
          href="/tools/sheet-splitter" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-emerald-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <FileSpreadsheet size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
                  초고속 분리
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
              엑셀시트 분리기
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              엑셀 파일 내 개별 시트를 단일 파일로 일괄 분리·저장
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-emerald-600 font-bold">
            <span>시트 분리하기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 8: 체육관 사용료 계산기 */}
        <Link 
          href="/tools/gym-calc" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-emerald-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <Calculator size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
                  조례 자동산출
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
              체육관 사용료
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              시설개방 조례 기준 대관료 및 냉난방비 자동 산출
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-emerald-600 font-bold">
            <span>사용료 계산</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* =========================================================================
            ROW 3: 행정 실무 & 서식 & 도면 (Purple Top Accent 🟣)
        ========================================================================= */}

        {/* CARD 9: 행정 자료실 */}
        <Link 
          href="/archive" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-purple-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-purple-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
                <FolderOpen size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 whitespace-nowrap">
                  102권
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
              행정 자료실
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              28개 분야 102권 공식 지침서 스트리밍 서고
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-purple-600 font-bold">
            <span>자료실 보기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 10: 나이스 임금대장 식대 분리기 */}
        <Link 
          href="/tools/sikdae" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-purple-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-purple-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
                <UtensilsCrossed size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 whitespace-nowrap">
                  급식비 보안
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
              임금대장 식대분리
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              나이스 임금대장 (이름-식대) 공제내역 간편 추출
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-purple-600 font-bold">
            <span>공제내역 추출</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 11: 증빙서 측면표지 제작기 */}
        <Link 
          href="/tools/label-maker" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-purple-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-purple-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
                <Tag size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 whitespace-nowrap">
                  라벨출력
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
              증빙서 측면표지
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              지출증빙서 측면 라벨 양식 자동 생성 및 규격 인쇄
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-purple-600 font-bold">
            <span>표지 만들기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CARD 12: 교실배치도 제작기 */}
        <Link 
          href="/tools/classmap" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-purple-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-purple-600 group-hover:h-[5px] transition-all" />

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

        {/* =========================================================================
            ROW 4: 힐링 포인트 (Rose Coral Top Accent 🔴)
        ========================================================================= */}

        {/* CARD 13: 수박 게임 */}
        <Link 
          href="/tools/watermelon" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-rose-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-rose-500 group-hover:h-[5px] transition-all" />

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

        {/* CARD 14: 스마트 공사원가 감사관 */}
        <Link 
          href="/tools/cost-audit" 
          className="relative overflow-hidden glass-card p-3.5 pt-4 flex flex-col justify-between h-[145px] group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-blue-600 group-hover:h-[5px] transition-all" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Calculator size={18} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 whitespace-nowrap">
                  2026 고시
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <h2 className="text-[15.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              스마트 공사원가 감사관
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-1 line-clamp-1 font-medium">
              조달청 법정 제비율 역산 대차대조 &amp; Gemini AI 서류 판독
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] text-blue-600 font-bold">
            <span>감사관 열기</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

      </section>

      {/* ========================================================
          3. SLIM SECURITY & PRIVACY NOTICE BANNER (컴팩트 슬림 배너)
      ======================================================== */}
      <section className="w-full max-w-[1400px] mx-auto mt-0.5">
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl py-2 px-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-center text-center gap-1.5 sm:gap-2.5 transition-all">
          
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

          {/* Title & Badge */}
          <div className="flex items-center justify-center gap-1.5 shrink-0">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span className="text-[13px] font-bold text-slate-900 tracking-tight">
              100% 브라우저 로컬 처리 &amp; 개인정보 안심 보안
            </span>
            <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.2 rounded-full border border-emerald-300">
              서버 유출 0%
            </span>
          </div>

          <span className="hidden sm:inline text-slate-300 text-xs">|</span>

          {/* Compact Description */}
          <p className="text-[12px] text-slate-600 font-medium truncate sm:overflow-visible">
            임금대장·예산정산·엑셀분리 등 모든 실무 데이터는 외부 서버 전송 없이 <strong className="text-emerald-700 font-bold">내 PC 메모리에서 0초 즉시 처리</strong>됩니다.
          </p>

        </div>
      </section>

      {/* ========================================================
          4. COMPACT FOOTER
      ======================================================== */}
      <footer className="w-full pt-1.5 pb-1 border-t border-slate-200 flex items-center justify-center text-[10.5px] sm:text-xs text-slate-400 font-medium">
        <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
      </footer>

    </div>
  );
}

