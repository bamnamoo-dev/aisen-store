'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Calculator,
  Bot,
  Navigation,
  MessageSquareShare,
  FileCheck,
  FolderOpen,
  UtensilsCrossed,
  Tag,
  FileSpreadsheet,
  LayoutGrid,
  ChartPie,
  LayoutDashboard,
  ShieldCheck,
  Search,
  ArrowRight,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';

interface ManualContentProps {
  onToolClick?: () => void;
  isModal?: boolean;
}

type TabKey = 'intro' | 'ai' | 'finance' | 'admin' | 'space';

export default function ManualContent({ onToolClick, isModal = false }: ManualContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('intro');

  const tabs: { id: TabKey; label: string; dotColor: string }[] = [
    { id: 'intro', label: '🏛️ 포털 둘러보기', dotColor: 'bg-slate-700' },
    { id: 'ai', label: '🔵 AI & 포털 허브', dotColor: 'bg-blue-600' },
    { id: 'finance', label: '🟢 회계 · 계약 · 예산', dotColor: 'bg-emerald-600' },
    { id: 'admin', label: '🟣 행정 실무 · 서고', dotColor: 'bg-purple-600' },
    { id: 'space', label: '🔴 공간 · 시설 · 힐링', dotColor: 'bg-rose-500' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800">
      
      {/* 1. 상단 탭 네비게이션 (시원하고 직관적인 크기) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 shrink-0 custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50/70 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. 탭별 안내 본문 (시인성 높은 큰 폰트 & 넓은 여백) */}
      <div className="flex flex-col gap-5">

        {/* ─── TAB 1: 🏛️ 포털 둘러보기 ─── */}
        {activeTab === 'intro' && (
          <div className="flex flex-col gap-5">
            {/* 상단 웰컴 카드 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-100 flex flex-col justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs sm:text-sm font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">AI-SEN STORE</span>
                <span className="text-xs sm:text-sm font-bold text-slate-500">서울특별시교육청 올인원 통합 포털</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                복잡한 학교 행정, 계산과 검수부터 AI 질의까지 한 곳에서 해결하세요
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                공식 지침서 102권 서고, 계약·공사원가 검수, 출장여비, 급여 식대 분리 등 15대 전문 프로그램을 원클릭으로 이용할 수 있습니다.
              </p>
            </div>

            {/* 메인 핵심 기능 3가지 안내 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3.5 shadow-2xs">
                    <Search size={22} />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 mb-1.5">스마트 검색창</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    메인 상단 검색창에 수의계약, 복무, 강사료 등 궁금한 실무 키워드를 입력하면 AI 챗봇이 102권 지침서 쪽수를 즉시 찾아줍니다.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-blue-600">
                  <span>질의 즉시 답변 연동</span>
                  <ArrowRight size={15} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3.5 shadow-2xs">
                    <Sparkles size={22} />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 mb-1.5">원클릭 데이터 파이프라인</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>[공사원가 검수 ➔ 계약 ➔ K-에듀파인 기안문]</strong>으로 데이터가 자동 전달되어 사유서와 품의가 한 번에 완성됩니다.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-emerald-600">
                  <span>복사·붙여넣기 제로</span>
                  <ArrowRight size={15} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3.5 shadow-2xs">
                    <ShieldCheck size={22} />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 mb-1.5">100% 로컬 보안 (유출 0%)</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    급여대장, 지출 결의서 등 업로드한 모든 엑셀 파일은 외부 서버 전송 없이 <strong>내 컴퓨터 메모리 안에서 0초 만에 처리</strong>됩니다.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-purple-600">
                  <span>개인정보 안심 보장</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>

            {/* 안내 팁 배너 */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-sm font-medium shadow-2xs">
              <Info size={18} className="text-amber-600 shrink-0" />
              <span>각 프로그램에 접속하시면 화면 상단바의 <strong>[사용설명서]</strong>를 통해 해당 프로그램 전용 상세 매뉴얼을 언제든지 열람할 수 있습니다.</span>
            </div>
          </div>
        )}

        {/* ─── TAB 2: 🔵 AI & 포털 허브 ─── */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. AI-SEN 행정챗봇 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                      <Bot size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 행정챗봇</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    3-Tier RAG
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  102권 서울교육 공식 지침서의 쪽수(Page)를 1:1 앵커링하여 뷰어로 직접 띄워주고 국가법령정보센터를 실시간 연동합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">지침서 쪽수 뷰어</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">최신 법령 자동 참조</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">출처 투명 공개</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <a
                  href="https://chatbot.aisen.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>챗봇 바로가기</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* 2. AI-SEN 출장여비 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                      <Navigation size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 출장여비</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    v4.9.2
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  카카오 길찾기 API(최대 3개 경유지)와 오피넷 실시간 유가를 연동하고, 19종 법정 감액을 자동 계산하여 A4 1장 인쇄를 지원합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">카카오 실시간 거리</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">오피넷 1일 6회 유가</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">A4 1p 정산서</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <a
                  href="https://chatbot.aisen.store/travel"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>출장여비 바로가기</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* 3. AI-SEN 소통게시판 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                      <MessageSquareShare size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 소통게시판</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    익명 Q&A
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  복잡한 회원가입 없이 4자리 간이 비밀번호만으로 서울특별시교육청 및 학교 교육행정 실무자들과 자유롭게 질문하고 노하우를 공유합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">가입 없는 4자리 핀</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">실무 질의응답</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">정보 나눔</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/board"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>게시판 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 4. AI-SEN 행정서식 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                      <FileCheck size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 행정서식</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    68종
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  계약, 인사, 복무, 보안 등 일선 학교 행정실에서 매일 사용하는 필수 법정 서식 68종의 미리보기와 원클릭 HWP 다운로드를 제공합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">필수 서식 68종</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">실시간 미리보기</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">HWP 즉시 다운</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <a
                  href="https://chatbot.aisen.store?forms=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>행정서식 바로가기</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 3: 🟢 회계 · 계약 · 예산 ─── */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. AI-SEN 계약 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                      <Compass size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 계약</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    2026 지침
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  공종과 예산만 선택하면 수의계약 대상 여부 판정, 법정 구비서류 체크리스트 편철, K-에듀파인 기안문 사유서를 자동으로 생성합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">4단계 의사결정</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">구비서류 자동 매핑</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">K-에듀파인 기안문 완성</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/contract"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>계약 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 2. AI-SEN 공사원가 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                      <Calculator size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 공사원가</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    간접비 감사
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  조달청 2026년 제비율 기준으로 원가계산서를 1원 단위 역산 검수하여 30일 미만 건강/연금 부당계상 0원 삭감액 및 대차대조표를 산출합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">30일 미만 건강·연금 0원</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">3중 파서(엑셀/PDF/AI)</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">감사결과 .xlsx 출력</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/cost-audit"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>공사원가 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 3. AI-SEN 학교회계 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                      <ChartPie size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 학교회계</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SFD 대시보드
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  학교 기본경비와 사업비, 본예산·추경 집행률, 비목별 지출 현황을 시각화 그래프로 한눈에 모니터링합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">예산 집행률 시각화</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">세부사업 모니터링</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">재정 통계 비교</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/sfd"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>학교회계 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 4. AI-SEN 예산정산 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                      <LayoutDashboard size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 예산정산</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    목적사업비
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  학교 급식비, 방과후학교, 수익자부담경비 및 목적사업비의 세입-세출 집행 내역을 대조하여 잔액을 자동 연산하고 보고서를 생성합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">세입-세출 1:1 대사</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">월별 집행 분석</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">정산서 출력</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/budget-settle"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>예산정산 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 4: 🟣 행정 실무 · 서고 ─── */}
        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. AI-SEN 행정서고 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                      <FolderOpen size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 행정서고</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    102권 서고
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  학교회계, 계약, 인사, 시설, 물품 등 28개 분야 102권 서울시교육청 공식 업무 길라잡이 PDF를 브라우저에서 실시간 스트리밍합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">28개 분야 102권</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">고속 PDF 스트리밍</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">키워드 즉시 검색</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/archive"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>행정서고 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 2. AI-SEN 급여식대 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                      <UtensilsCrossed size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 급여식대</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    0초 추출
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  나이스(NEIS) 급여대장에서 성명(B열)과 급식비 식대(D열)를 0.1초 만에 자동 정제 추출하여 개별/통합 엑셀로 내려받습니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">100% 로컬 보안</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">성명·식대 고정밀 매핑</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">정제 엑셀 즉시 저장</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/sikdae"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>급여식대 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 3. AI-SEN 지출바인더 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                      <Tag size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 지출바인더</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    A4 실측 인쇄
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  지출결의서 및 각종 증빙서 바인더 두께(너비 cm)에 맞추어 연도, 분기, 일련번호가 포함된 측면 철 라벨을 규격대로 인쇄합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">바인더 너비 cm 맞춤</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">A4 1:1 실측 인쇄</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">규격 서식 자동 생성</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/label-maker"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>지출바인더 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 4. AI-SEN 엑셀분리 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                      <FileSpreadsheet size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 엑셀분리</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    시트 분할
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  수십 개의 다중 탭 시트로 구성된 대형 엑셀 파일을 0.2초 만에 개별 파일로 분할하고 ZIP 압축 파일로 일괄 저장합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">다중 시트 일괄 분할</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">0초 ZIP 압축</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">선택 다운로드</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/sheet-splitter"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>엑셀분리 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 5: 🔴 공간 · 시설 · 힐링 ─── */}
        {activeTab === 'space' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. AI-SEN 시설대관 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-2xs">
                      <Calculator size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 시설대관</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    조례 기준
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  학교시설 개방 조례에 맞추어 체육관/운동장 대관 시간, 기본료, 조명료, 냉난방 가산료(20%) 및 법정 감면율을 자동 산출합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">조례 감면(40~100%)</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">냉난방 자동 가산</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">견적서 인쇄</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/gym-calc"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>시설대관 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 2. AI-SEN 교실배치 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-2xs">
                      <LayoutGrid size={20} />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 교실배치</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    평면도 시각화
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  층별·호수별 학교 교실과 특별실 배치도를 시각적으로 편집하고, 학년도별 설정을 JSON으로 백업/복원하며 A4 도면으로 출력합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">인터랙티브 캔버스</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">JSON 백업/복원</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">A4 도면 인쇄</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/classmap"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>교실배치 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 3. AI-SEN 힐링게임 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shadow-2xs">
                      🍉
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">AI-SEN 힐링게임</h4>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    수박게임
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  과일을 떨어뜨려 합치는 2D 물리 퍼즐 게임으로, 서울 교직원 실시간 랭킹과 긴급 엑셀 위장 보스키(`` ` `` 백틱 키)를 제공합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">물리 퍼즐 힐링</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">서울 랭킹 Top 10</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">엑셀 위장 보스키</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <Link
                  href="/tools/watermelon"
                  onClick={onToolClick}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>힐링게임 바로가기</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
