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
  Printer,
  ExternalLink,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface ManualContentProps {
  onToolClick?: () => void;
  isModal?: boolean;
}

export default function ManualContent({ onToolClick, isModal = false }: ManualContentProps) {
  const [activeTab, setActiveTab] = useState<'scenario' | 'pipeline' | 'tools' | 'audit' | 'security'>('scenario');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 print:text-black">
      
      {/* 1. 상단 컨트롤 바 (검색 + 인쇄 + 탭 버튼) - 화면 전용 (인쇄 시 숨김) */}
      <div className="flex flex-col gap-3 print:hidden">
        
        {/* 상단 액션 행: 인덱스 검색창 + 인쇄 버튼 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="실무 키워드 검색 (예: 공사, 식대, 수의계약, 30일, 여비...)"
              className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="행정실 책상용 A4 2장 요약본 인쇄"
            >
              <Printer size={14} className="text-blue-600" />
              <span>실무 책상용 A4 인쇄</span>
            </button>
          </div>
        </div>

        {/* 5대 테마 탭 내비게이션 */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('scenario')}
            className={`px-3 py-1.5 text-xs sm:text-[13px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'scenario'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🧭 상황별 빠른 길찾기</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 text-xs sm:text-[13px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-white text-emerald-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔄 원스톱 데이터 파이프라인</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 text-xs sm:text-[13px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛠️ 15대 통합 도구 완벽 백과</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs sm:text-[13px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-rose-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⚖️ 2026 감사 대비 치트시트</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 text-xs sm:text-[13px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-purple-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔒 보안 원리 & 실무 꿀팁</span>
          </button>
        </div>
      </div>

      {/* 2. 본문 컨텐츠 (화면 뷰어 영역) */}
      <div className="flex flex-col gap-6">

        {/* ========================================================
            TAB 1: 상황별 빠른 길찾기 (6대 실무 시나리오 매트릭스)
        ======================================================== */}
        {(activeTab === 'scenario' || searchQuery) && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="text-blue-600">🧭</span> 6대 핵심 행정업무 상황별 원스톱 길찾기
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">행정실 일상 업무 100% 매핑</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* 시나리오 1: 소액 시설보수 공사 건 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      공사 발주
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">소요시간: 30초</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    1. 학교 시설보수 및 소규모 공사 건
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    업체 견적서/원가서가 접수되었을 때 제비율 검수부터 수의계약 기안까지 원스톱으로 끝냅니다.
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-emerald-600 shrink-0" />
                      <span><strong>STEP 1</strong>: <code className="text-emerald-700 font-mono">AI-SEN 공사원가</code>로 조달청 제비율 100% 역산 감사 (30일 미만 건보/국연 0원 확인)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-emerald-600 shrink-0" />
                      <span><strong>STEP 2</strong>: [🧭 계약나침반으로 연동] 버튼 1클릭 ➔ 금액·공종 자동 전달</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-emerald-600 shrink-0" />
                      <span><strong>STEP 3</strong>: <code className="text-blue-700 font-mono">AI-SEN 계약</code>에서 수의계약 판정 및 K-에듀파인 기안문 사유서 1초 복사</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Link
                    href="/tools/cost-audit"
                    onClick={onToolClick}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>공사원가 실행</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* 시나리오 2: 수학여행·수련활동·전세버스 체험학습 건 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      체험학습
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">2026 길라잡이 준수</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. 수학여행·수련활동·전세버스 계약 건
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    교통안전공단 검증, 안전요원 자격, 수련시설 종합평가 등 까다로운 법정 서류를 누락 없이 챙깁니다.
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-blue-600 shrink-0" />
                      <span><strong>STEP 1</strong>: <code className="text-blue-700 font-mono">AI-SEN 계약</code>에서 세부유형(테마여행 B12 / 수련활동 B13 / 전세버스 B07) 선택</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-blue-600 shrink-0" />
                      <span><strong>STEP 2</strong>: TS교통안전정보 문서확인번호, 14시간 안전요원 연수증 체크리스트 확인</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-blue-600 shrink-0" />
                      <span><strong>STEP 3</strong>: 2026 수의계약 통합서약서(.hwpx) 다운로드 및 A4 편철 인쇄</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Link
                    href="/tools/contract"
                    onClick={onToolClick}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>계약 솔루션 실행</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* 시나리오 3: 매월 교직원 급여 지급 및 식대 공제 건 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      급여·식대
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">0.1초 추출</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    3. 매월 교직원 급여 대장 식대 정산 건
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    나이스(NEIS) 임금대장에서 성명과 식대 공제액만 분리하여 세입/지출 회계 정리를 1초 만에 마칩니다.
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-purple-600 shrink-0" />
                      <span><strong>STEP 1</strong>: 나이스 임금대장 엑셀을 <code className="text-purple-700 font-mono">AI-SEN 급여식대</code> 화면에 드래그&드롭</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-purple-600 shrink-0" />
                      <span><strong>STEP 2</strong>: B열(성명)과 D열(식대)이 정규식으로 0.1초 만에 깔끔 정제</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-purple-600 shrink-0" />
                      <span><strong>STEP 3</strong>: 통합/개별 엑셀 파일 다운로드 (브라우저 메모리 100% 보안)</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Link
                    href="/tools/sikdae"
                    onClick={onToolClick}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>급여식대 실행</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* 시나리오 4: 관내/관외 출장 복무 결재 및 출장비 산출 건 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      출장여비
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">오피넷 1일 6회 연동</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    4. 관내·관외 출장여비 정산 및 원인행위 건
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    카카오 3개 경유지 길찾기와 오피넷 실시간 주유소 가격을 자동 반영하여 무오차 여비 정산서를 만듭니다.
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-blue-600 shrink-0" />
                      <span><strong>STEP 1</strong>: <code className="text-blue-700 font-mono">AI-SEN 출장여비</code>에서 출발지·경유지·도착지 원터치 칩 클릭</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-blue-600 shrink-0" />
                      <span><strong>STEP 2</strong>: 유류비·통행료 자동 연산 및 관용차/공무원 여비규정 19종 법정 감액 적용</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-blue-600 shrink-0" />
                      <span><strong>STEP 3</strong>: 지출결의서 첨부용 A4 1페이지 에코 화이트 정산서 인쇄</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                  <a
                    href="https://chatbot.aisen.store/travel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>출장여비 열기</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* 시나리오 5: 학교 체육관·시설 주민 대관 신청 건 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-rose-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      시설개방
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">서울시 조례 100%</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    5. 체육관·운동장 등 학교시설 주민 대관 건
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    서울시 학교시설개방 조례 공식에 따라 단기/장기 대관 시간, 냉난방 가산료, 감면액을 자동 계산합니다.
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-rose-600 shrink-0" />
                      <span><strong>STEP 1</strong>: <code className="text-rose-700 font-mono">AI-SEN 시설대관</code>에서 면적·이용시간·냉난방 여부 선택</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-rose-600 shrink-0" />
                      <span><strong>STEP 2</strong>: 조례 감면 대상(국가유공자 50%, 장애인 60%, 학교체육 100%) 자동 적용</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-rose-600 shrink-0" />
                      <span><strong>STEP 3</strong>: 민원인 고지용 공식 견적서 및 사용허가서 즉시 출력</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Link
                    href="/tools/gym-calc"
                    onClick={onToolClick}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>시설대관 실행</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* 시나리오 6: 학기말 결의서 편철 및 교실 배치 건 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      행정마무리
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">라벨 + 도면 출력</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    6. 학기말/학년말 바인더 편철 & 교실 재배치 건
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    지출결의서 바인더 두께별 척추 라벨 인쇄와 신학년도 층별 교실배치도 출력을 지원합니다.
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-purple-600 shrink-0" />
                      <span><strong>STEP 1</strong>: <code className="text-purple-700 font-mono">AI-SEN 지출바인더</code>에서 바인더 두께(3/5/7cm) 지정 후 A4 1:1 인쇄</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-rose-700 shrink-0" />
                      <span><strong>STEP 2</strong>: <code className="text-rose-700 font-mono">AI-SEN 교실배치</code>에서 학년도별 평면도 작성 및 SVG/A4 도면 출력</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight size={13} className="text-purple-600 shrink-0" />
                      <span><strong>STEP 3</strong>: 다중 시트 엑셀은 <code className="text-purple-700 font-mono">AI-SEN 엑셀분리</code>로 0.2초 만에 단일 파일 ZIP 분할</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Link
                    href="/tools/label-maker"
                    onClick={onToolClick}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>지출바인더</span>
                    <ArrowRight size={12} />
                  </Link>
                  <Link
                    href="/tools/classmap"
                    onClick={onToolClick}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>교실배치</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================
            TAB 2: 원스톱 데이터 파이프라인 (Data Synergy)
        ======================================================== */}
        {(activeTab === 'pipeline' || searchQuery) && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="text-emerald-600">🔄</span> 데이터가 흐르는 '원스톱 업무 파이프라인'
              </h2>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                100% 연동 가동 중
              </span>
            </div>

            {/* 시각적 파이프라인 다이어그램 */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md">
              <div className="text-center mb-4">
                <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">End-to-End Workflow</span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  [공사원가 역산 감사 ➔ 계약방식 판정 ➔ K-에듀파인 기안문 1초 복사]
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  복사-붙여넣기 없이, 하나의 업무 흐름으로 종결되는 공공행정 최초의 데이터 파이프라인
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
                
                {/* 1단계 */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
                      <span>STEP 1</span>
                      <span>AI-SEN 공사원가</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">조달청 제비율 무오차 역산</h4>
                    <ul className="text-xs text-slate-300 mt-2 space-y-1">
                      <li>• 엑셀·PDF·화면캡처 3초 분석</li>
                      <li>• 30일 미만 건보/국연 부당계상 적발</li>
                      <li>• 산안비·일반관리비 상한 검증</li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-emerald-300 font-semibold">
                    ➔ 확정 도급액·공종·공사명 추출
                  </div>
                </div>

                {/* 2단계 */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-blue-400 font-bold mb-1">
                      <span>STEP 2</span>
                      <span>AI-SEN 계약</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">수의계약 판정 및 서류 필터링</h4>
                    <ul className="text-xs text-slate-300 mt-2 space-y-1">
                      <li>• 원클릭으로 금액·공종 파라미터 전달</li>
                      <li>• 1인수의 vs 2인견적 자동 판정</li>
                      <li>• 맞춤 구비서류 체크리스트 편철</li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-blue-300 font-semibold">
                    ➔ 2026 수의계약 통합서약서 다운로드
                  </div>
                </div>

                {/* 3단계 */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
                      <span>STEP 3</span>
                      <span>K-에듀파인 기안문</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">사유서 자동완성 & 1초 복사</h4>
                    <ul className="text-xs text-slate-300 mt-2 space-y-1">
                      <li>• 사업목적·예정가격 산출내역 완성</li>
                      <li>• 계약상대자 결정 사유 완벽 기안문</li>
                      <li>• [📋 기안문 복사] 눌러 즉시 붙여넣기</li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-amber-300 font-semibold">
                    ➔ 품의·원인행위 결재 완료!
                  </div>
                </div>

              </div>
            </div>

            {/* 중앙 요율 통제 체계 안내 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-emerald-600">⚙️</span> 매년 개정되는 조달청 요율의 중앙 통제 체계 (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">rates-config.json</code>)
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                매년 1~3월 개정 고시되는 조달청 간접공사비 제비율과 지방계약법 소액수의 한도액은 포털 단 한 곳(<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">public/data/rates-config.json</code>)에서 중앙 집중 관리됩니다. 실무자는 번거로운 요율 갱신 걱정 없이 항상 최신 법정 기준을 1원 단위 무오차로 활용할 수 있습니다.
              </p>
            </div>
          </section>
        )}

        {/* ========================================================
            TAB 3: 15대 통합 도구 완벽 백과 (4×4 매트릭스 & 론처)
        ======================================================== */}
        {(activeTab === 'tools' || searchQuery) && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600">🛠️</span> 15대 통합 도구 완벽 백과 (상세 명세 & 즉시 실행)
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">4×4 테마별 완벽 분류</span>
            </div>

            {/* 1행: AI & 포털 허브 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                1행: AI & 포털 허브 (🔵 4종)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-blue-700">AI-SEN 행정챗봇</span>
                      <Bot size={16} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      28개 분야 102권 지침서 1:1 쪽수 앵커링 RAG 챗봇. 실제 지침서 원문 PDF를 0.1초 만에 바로보기 지원.
                    </p>
                  </div>
                  <a
                    href="https://chatbot.aisen.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>실행하기</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-blue-700">AI-SEN 출장여비</span>
                      <Navigation size={16} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      카카오 실시간 3개 경유지 길찾기 + 오피넷 1일 6회 유가 연동, 19종 법정 감액 및 A4 1p 인쇄.
                    </p>
                  </div>
                  <a
                    href="https://chatbot.aisen.store/travel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>실행하기</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-blue-700">AI-SEN 소통게시판</span>
                      <MessageSquareShare size={16} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      회원가입 없이 4자리 암호로 질의/공유하는 실무 소통 Q&A 게시판. 서식 제보 및 지침서 보완 요청.
                    </p>
                  </div>
                  <Link
                    href="/board"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-blue-700">AI-SEN 행정서식</span>
                      <FileCheck size={16} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      인사·복무·계약·지출 공식 68종 행정 서식 실시간 미리보기 및 HWP/HWPX 다이렉트 다운로드.
                    </p>
                  </div>
                  <a
                    href="https://chatbot.aisen.store?forms=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>서식함 열기</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

              </div>
            </div>

            {/* 2행: 회계 & 계약 & 예산 */}
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                2행: 회계 & 계약 & 예산 (🟢 4종)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-700">AI-SEN 계약</span>
                      <Compass size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      2026 서울시교육청 지침 준수, 4단계 의사결정, 구비서류 체크리스트 편철, K-에듀파인 기안문 자동생성.
                    </p>
                  </div>
                  <Link
                    href="/tools/contract"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-700">AI-SEN 공사원가</span>
                      <Calculator size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      2026 조달청 간접공사비 100% 역산 감사, 3중 파서(엑셀/PDF/AI비전), 30일 미만 건보/국연 0원 삭감.
                    </p>
                  </div>
                  <Link
                    href="/tools/cost-audit"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-700">AI-SEN 학교회계</span>
                      <ChartPie size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      서울시교육청 학교회계 정보 모니터링 대시보드(SFD). 본예산/추경/지출 집행률 실시간 시각화.
                    </p>
                  </div>
                  <Link
                    href="/tools/sfd"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-700">AI-SEN 예산정산</span>
                      <LayoutDashboard size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      수익자부담·목적사업비 세입세출 실시간 1:1 정산. 예산 대비 실제 지출 및 잔액 자동 분석.
                    </p>
                  </div>
                  <Link
                    href="/tools/budget-settle"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

              </div>
            </div>

            {/* 3행: 행정 실무 & 서고 */}
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-xs font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                3행: 행정 실무 & 서고 (🟣 4종)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-purple-700">AI-SEN 행정서고</span>
                      <FolderOpen size={16} className="text-purple-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      28개 분야 102권 서울교육 공식 지침서 전자책 스트리밍 서고. 목차 검색 및 원문 열람.
                    </p>
                  </div>
                  <Link
                    href="/archive"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    <span>서고 열기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-purple-700">AI-SEN 급여식대</span>
                      <UtensilsCrossed size={16} className="text-purple-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      나이스 임금대장에서 성명(B열)과 식대(D열)을 0.1초 만에 추출하는 100% 브라우저 메모리 안전 도구.
                    </p>
                  </div>
                  <Link
                    href="/tools/sikdae"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-purple-700">AI-SEN 지출바인더</span>
                      <Tag size={16} className="text-purple-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      지출결의서/증빙서 바인더 두께(cm)별 척추 라벨 자동 생성 및 표준 A4 실측 1:1 인쇄.
                    </p>
                  </div>
                  <Link
                    href="/tools/label-maker"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-purple-700">AI-SEN 엑셀분리</span>
                      <FileSpreadsheet size={16} className="text-purple-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      다중 시트(탭) 엑셀을 0.2초 만에 개별 파일로 분할하고 선택 시트 일괄 ZIP 압축 다운로드.
                    </p>
                  </div>
                  <Link
                    href="/tools/sheet-splitter"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

              </div>
            </div>

            {/* 4행: 공간 & 시설 & 힐링 */}
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                4행: 공간 & 시설 & 힐링 (🔴 3종)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-rose-700">AI-SEN 시설대관</span>
                      <Calculator size={16} className="text-rose-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      서울시 학교시설 개방 조례 공식에 따른 체육관/운동장 대관 시간·냉난방 가산료·감면율 자동 연산.
                    </p>
                  </div>
                  <Link
                    href="/tools/gym-calc"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-rose-700">AI-SEN 교실배치</span>
                      <LayoutGrid size={16} className="text-rose-600" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      층별·호수별 학교 평면도 그리드 시각화, 교실 테마 배정, A4 도면 인쇄 및 JSON 백업/복원.
                    </p>
                  </div>
                  <Link
                    href="/tools/classmap"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    <span>바로가기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-rose-700">AI-SEN 힐링게임</span>
                      <span className="text-sm">🍉</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      과일 합치기 힐링 물리 게임, 전국 교직원 실시간 랭킹 Top 10, 🤫 긴급 엑셀 위장 보스키(`` ` ``) 탑재.
                    </p>
                  </div>
                  <Link
                    href="/tools/watermelon"
                    onClick={onToolClick}
                    className="mt-3 pt-2 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    <span>게임하기</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

              </div>
            </div>

          </section>
        )}

        {/* ========================================================
            TAB 4: 2026 감사 대비 & 법적 체크포인트 (치트시트)
        ======================================================== */}
        {(activeTab === 'audit' || searchQuery) && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="text-rose-600">⚖️</span> 2026 교육행정 법정 한도 & 감사 방어 치트시트
              </h2>
              <span className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
                감사관 핵심 적발 포인트 완벽 방어
              </span>
            </div>

            {/* 치트시트 테이블 1: 수의계약 및 서류간소화 기준 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3">구분</th>
                    <th className="py-2.5 px-3">적용 금액 기준</th>
                    <th className="py-2.5 px-3">핵심 지침 및 생략 특례</th>
                    <th className="py-2.5 px-3">관련 근거 법령</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">1인 소액수의 (일반)</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">추정가격 2,000만 원 이하</td>
                    <td className="py-2.5 px-3">전자견적 없이 1인 견적으로 계약 체결 가능 (분할수의 금지)</td>
                    <td className="py-2.5 px-3 text-slate-500">지방계약법 시행령 제25조제1항제5호</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">1인 소액수의 (배려기업)</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">추정가격 5,000만 원 이하</td>
                    <td className="py-2.5 px-3">여성·장애인·사회적기업 확인서 보유 시 1인 견적 가능</td>
                    <td className="py-2.5 px-3 text-slate-500">지방계약법 시행령 제25조제1항제5호 마목</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 bg-emerald-50/30">
                    <td className="py-2.5 px-3 font-bold text-emerald-900">서류간소화 특례</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-800">추정가격 500만 원 미만</td>
                    <td className="py-2.5 px-3 text-emerald-950"><strong>4대 사회보험료 완납증명서 & 노무비 지급내역서 제출 전면 생략</strong></td>
                    <td className="py-2.5 px-3 text-emerald-800 font-medium">서울교육청 계약서류간소화(교육재정과-18968)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">초소액 특례</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">추정가격 100만 원 이하</td>
                    <td className="py-2.5 px-3">견적서 징구 생략 가능(인터넷 캡처 갈음), 승낙사항 공급자 날인 생략</td>
                    <td className="py-2.5 px-3 text-slate-500">서울시교육비특별회계 재무회계규칙</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">계약보증금 면제</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">계약금액 5,000만 원 이하</td>
                    <td className="py-2.5 px-3">계약보증금 납부 면제 (지급확약서로 갈음, 승낙사항 시 확약서도 생략)</td>
                    <td className="py-2.5 px-3 text-slate-500">지방계약법 시행령 제53조</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">검사조서 생략</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">계약금액 3,000만 원 이하</td>
                    <td className="py-2.5 px-3">정식 준공/납품검사조서 작성 생략 (지출결의서 검사인 날인 대체)</td>
                    <td className="py-2.5 px-3 text-slate-500">지방계약법 시행령 제67조</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">소규모 공사 서류 생략</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">계약금액 1,000만 원 미만</td>
                    <td className="py-2.5 px-3">착공계·현장대리인계·공정표·준공계 생략 가능 (공사 전후 사진대지 갈음)</td>
                    <td className="py-2.5 px-3 text-slate-500">2026 서울시교육청 계약처리지침</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3대 핵심 감사 지적 방어 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-1">
                    <AlertTriangle size={14} />
                    <span>주의 1. 분할 수의계약 (쪼개기 발주)</span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed mt-1">
                    동일 시기, 동일 용도, 동일 예산 비목의 사업을 정당한 사유 없이 2,000만 원 이하로 나누어 수의계약 체결 시 중대한 감사 지적 대상이 됩니다.
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-rose-700 font-bold">
                  ➔ 연간 소요액 합산 2천만 초과 시 전자견적 진행!
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1">
                    <AlertTriangle size={14} />
                    <span>주의 2. 동일업체 연간 4회 계약 제한</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed mt-1">
                    추정가격 500만 원 이상 수의계약 시 특정 업체와의 계약 체결 횟수는 당해 회계연도 총 4회를 초과할 수 없습니다. (여성/장애인기업 등 특례 제외).
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-amber-700 font-bold">
                  ➔ 연간 계약 이력 사전 누적 확인 필수!
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 mb-1">
                    <AlertTriangle size={14} />
                    <span>주의 3. 30일 미만 공사 사회보험료 삭감</span>
                  </div>
                  <p className="text-xs text-blue-900 leading-relaxed mt-1">
                    공사기간이 30일 미만인 공사는 건강보험·국민연금·노인장기요양보험료 대상이 아닙니다. 계상되어 있다면 전액 삭감 조치해야 합니다.
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-blue-700 font-bold">
                  ➔ AI-SEN 공사원가에서 자동 0원 차단!
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================
            TAB 5: 100% 로컬 보안 원리 & 실무 꿀팁
        ======================================================== */}
        {(activeTab === 'security' || searchQuery) && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="text-purple-600">🔒</span> 100% 브라우저 메모리 보안 원리 & 숨겨진 실무 꿀팁
              </h2>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                서버 유출 0% 기술 보증
              </span>
            </div>

            {/* 기술 보안 다이어그램 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>왜 교직원 급여나 계약 내역이 인터넷 서버로 유출되지 않는가?</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                  <span className="font-bold text-slate-800">🚫 기존 일반 웹사이트 (서버 업로드 방식)</span>
                  <p>사용자 PC ➔ 엑셀 파일 업로드 ➔ 원격 인터넷 서버 저장 ➔ 파싱 후 결과 다운로드 (개인정보 유출 위험 발생)</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col gap-1.5">
                  <span className="font-bold text-emerald-900">🛡️ AI-SEN 아키텍처 (100% 브라우저 클라이언트 연산)</span>
                  <p className="text-emerald-800">사용자 PC 브라우저 RAM 안에서 SheetJS로 0초 만에 파싱 ➔ <strong>외부 서버 전송 트래픽 0 바이트</strong> ➔ 브라우저 닫으면 메모리 자동 소멸 (100% 규정 준수)</p>
                </div>
              </div>
            </div>

            {/* 실무 꿀팁 & 단축키 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <span className="text-base">🤫</span>
                    <span>긴급 엑셀 위장 보스키 (Boss Key)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    힐링 수박 게임 중 관리자나 교직원 방문 시 키보드의 <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[11px]">`</kbd> (숫자 1 옆 백틱 키)를 누르면 즉시 가짜 엑셀 예산표로 위장 전환됩니다.
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 font-medium">
                  다시 누르면 게임으로 복귀
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <span className="text-base">✂️</span>
                    <span>원가계산서 3초 캡처 붙여넣기</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    원가계산서 화면에서 <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">Win</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">Shift</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">S</kbd> 로 캡처한 후, 화면 클릭 후 <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">V</kbd> 를 누르면 AI가 즉시 제비율을 자동 인식합니다.
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-blue-600 font-medium">
                  스캔본 회전 판독 완벽 지원
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <span className="text-base">🔐</span>
                    <span>소통게시판 4자리 암호 관리</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    소통게시판은 회원가입이나 개인정보 입력 없이, 글 작성 시 입력한 본인만의 4자리 숫자 비밀번호로 언제든지 수정 및 삭제가 가능합니다.
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-purple-600 font-medium">
                  100% 익명 실무 질문 보장
                </div>
              </div>

            </div>
          </section>
        )}

      </div>

      {/* ========================================================
          3. A4 2장 규격 실무 책상용 전용 인쇄 출력 양식 (화면 숨김, @media print 전용)
      ======================================================== */}
      <div className="hidden print:block font-sans text-black leading-tight text-[11px]">
        
        {/* 인쇄 1페이지: 15대 도구 마스터 맵 & 핵심 업무 시나리오 파이프라인 */}
        <div className="print-page mb-8" style={{ pageBreakAfter: 'always' }}>
          <div className="border-b-2 border-black pb-2 mb-3 flex items-end justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight text-black">AI-SEN STORE 교육행정 실무 마스터 가이드</h1>
              <p className="text-[11px] text-gray-700 mt-0.5">전국 교육행정 공무원을 위한 15대 스마트 도구 및 데이터 파이프라인 매뉴얼</p>
            </div>
            <div className="text-right text-[10px] text-gray-600">
              <span>https://www.aisen.store</span><br/>
              <span>[PAGE 1 / 2 - 업무 시나리오 맵]</span>
            </div>
          </div>

          <h2 className="text-xs font-bold text-black border-l-3 border-blue-600 pl-1.5 mb-1.5">1. 상황별 핵심 업무 길찾기 (6대 실무 시나리오)</h2>
          <table className="w-full border-collapse border border-gray-400 text-[10px] mb-4">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 font-bold">
                <th className="border border-gray-300 p-1 w-[22%]">업무 상황</th>
                <th className="border border-gray-300 p-1 w-[20%]">연계 도구 순서</th>
                <th className="border border-gray-300 p-1 w-[58%]">원스톱 실무 처리 흐름</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">시설공사 보수 발주</td>
                <td className="border border-gray-300 p-1 font-semibold text-emerald-800">공사원가 ➔ 계약</td>
                <td className="border border-gray-300 p-1">조달청 제비율 역산 감사(30일 미만 건보/국연 0원) ➔ 계약방식 판정 ➔ K-에듀파인 기안문 1초 복사</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">수학여행·체험학습</td>
                <td className="border border-gray-300 p-1 font-semibold text-blue-800">계약 솔루션</td>
                <td className="border border-gray-300 p-1">세부유형(B12/B13/B07) ➔ TS교통안전·14시간안전요원 체크 ➔ 수의계약 통합서약서 출력</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">급여 지급 및 식대정산</td>
                <td className="border border-gray-300 p-1 font-semibold text-purple-800">급여식대</td>
                <td className="border border-gray-300 p-1">나이스 임금대장 엑셀 드롭 ➔ 0.1초 만에 B열(성명)/D열(식대) 분리 ➔ 세입/지출 연계</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">출장여비 정산</td>
                <td className="border border-gray-300 p-1 font-semibold text-blue-800">출장여비</td>
                <td className="border border-gray-300 p-1">카카오 3개 경유지 + 오피넷 유가 연동 ➔ 19종 법정 감액 ➔ A4 1p 정산서 출력</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">체육관 등 시설 대관</td>
                <td className="border border-gray-300 p-1 font-semibold text-rose-800">시설대관</td>
                <td className="border border-gray-300 p-1">서울시 조례 기준 면적별 기본료 + 냉난방 20% + 감면(50%/60%/100%) 자동 견적서 발급</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">바인더 편철·교실배치</td>
                <td className="border border-gray-300 p-1 font-semibold text-purple-800">지출바인더/교실배치</td>
                <td className="border border-gray-300 p-1">3/5/7cm 결의서 척추 라벨 A4 1:1 인쇄 + 층별 교실배치도 SVG 출력 & JSON 백업</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-xs font-bold text-black border-l-3 border-emerald-600 pl-1.5 mb-1.5">2. 15대 통합 도구 한눈에 보기 (4 × 4 라인업)</h2>
          <div className="grid grid-cols-4 gap-1.5 text-[9.5px]">
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-blue-800">AI-SEN 행정챗봇</div>
              <div>102권 서고 쪽수 앵커링 챗봇</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-blue-800">AI-SEN 출장여비</div>
              <div>카카오+오피넷 실시간 정산</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-blue-800">AI-SEN 소통게시판</div>
              <div>4자리 암호 익명 실무 Q&A</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-blue-800">AI-SEN 행정서식</div>
              <div>68종 필수 서식 HWP 다운로드</div>
            </div>

            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-emerald-800">AI-SEN 계약</div>
              <div>2026 지침 수의계약 판정기안</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-emerald-800">AI-SEN 공사원가</div>
              <div>조달청 제비율 100% 역산 감사</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-emerald-800">AI-SEN 학교회계</div>
              <div>SFD 세부사업 실시간 모니터링</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-emerald-800">AI-SEN 예산정산</div>
              <div>수익자부담·목적사업비 정산</div>
            </div>

            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-purple-800">AI-SEN 행정서고</div>
              <div>28개 분야 102권 PDF 스트리밍</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-purple-800">AI-SEN 급여식대</div>
              <div>나이스 급여대장 B·D열 정제</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-purple-800">AI-SEN 지출바인더</div>
              <div>A4 실측 1:1 측면 척추 라벨</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-purple-800">AI-SEN 엑셀분리</div>
              <div>다중 시트 분할 및 ZIP 압축</div>
            </div>

            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-rose-800">AI-SEN 시설대관</div>
              <div>조례 기준 대관료 자동 견적</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded">
              <div className="font-bold text-rose-800">AI-SEN 교실배치</div>
              <div>층별 평면도 및 도면 A4 인쇄</div>
            </div>
            <div className="border border-gray-300 p-1.5 rounded col-span-2">
              <div className="font-bold text-rose-800">AI-SEN 힐링게임</div>
              <div>전국 교직원 랭킹 수박 게임 & 긴급 엑셀 위장 보스키(`` ` ``) 탑재</div>
            </div>
          </div>
        </div>

        {/* 인쇄 2페이지: 2026 감사 대비 법정 한도 & 서류 간소화 치트시트 */}
        <div className="print-page" style={{ pageBreakBefore: 'always' }}>
          <div className="border-b-2 border-black pb-2 mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-base font-black tracking-tight text-black">2026 교육행정 법정 한도 & 감사 방어 치트시트</h2>
              <p className="text-[10px] text-gray-700 mt-0.5">지방계약법령, 행정안전부 예규, 서울시교육청 계약처리지침 핵심 요약</p>
            </div>
            <div className="text-right text-[10px] text-gray-600">
              <span>[PAGE 2 / 2 - 감사 방어 치트시트]</span>
            </div>
          </div>

          <h3 className="text-xs font-bold text-black border-l-3 border-rose-600 pl-1.5 mb-1.5">1. 계약 금액대별 필수 서류 및 법정 생략 특례</h3>
          <table className="w-full border-collapse border border-gray-400 text-[10px] mb-4">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 font-bold">
                <th className="border border-gray-300 p-1">구분</th>
                <th className="border border-gray-300 p-1">금액 기준</th>
                <th className="border border-gray-300 p-1">필수 서류 및 법정 생략 특례 내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">1인 소액수의</td>
                <td className="border border-gray-300 p-1">추정 2,000만 원 이하 (배려기업 5,000만)</td>
                <td className="border border-gray-300 p-1">단일 업체 견적으로 수의계약 가능 (동일시기·동일용도 분할 쪼개기 발주 절대 금지)</td>
              </tr>
              <tr className="bg-emerald-50">
                <td className="border border-gray-300 p-1 font-bold">서류간소화 특례</td>
                <td className="border border-gray-300 p-1 font-bold text-emerald-900">추정 500만 원 미만</td>
                <td className="border border-gray-300 p-1 font-semibold text-emerald-900">4대 사회보험료 완납증명서 및 노무비 지급내역서 제출 전면 생략 가능 (교육재정과-18968)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">소액 견적 생략</td>
                <td className="border border-gray-300 p-1">추정 100만 원 이하</td>
                <td className="border border-gray-300 p-1">견적서 생략(인터넷 캡처 갈음), 승낙사항 공급자 날인 생략 가능</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">계약보증금 면제</td>
                <td className="border border-gray-300 p-1">계약금액 5,000만 원 이하</td>
                <td className="border border-gray-300 p-1">지급확약서로 갈음 (계약서 대신 승낙사항으로 계약 시 확약서도 생략 가능)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">검사조서 생략</td>
                <td className="border border-gray-300 p-1">계약금액 3,000만 원 이하</td>
                <td className="border border-gray-300 p-1">정식 준공/납품검사조서 생략 (지출결의서 검사인 날인으로 대체)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1 font-bold">소액공사 서류</td>
                <td className="border border-gray-300 p-1">계약금액 1,000만 원 미만</td>
                <td className="border border-gray-300 p-1">착공계·현장대리인계·공정표·준공계 생략 가능 (현장 전후 사진대지로 갈음)</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-xs font-bold text-black border-l-3 border-amber-600 pl-1.5 mb-1.5">2. 교육청 종합감사 필수 4대 수검 체크포인트</h3>
          <div className="grid grid-cols-2 gap-2 text-[9.5px]">
            <div className="border border-gray-300 p-2 rounded">
              <div className="font-bold text-red-700 mb-0.5">① 동일업체 연간 4회 계약 제한</div>
              <div>추정가격 500만 원 이상 수의계약 시 특정 업체와의 계약 체결 횟수는 당해 회계연도 총 4회를 초과할 수 없음. (배려기업 특례나 조달몰 직접구매 제외)</div>
            </div>
            <div className="border border-gray-300 p-2 rounded">
              <div className="font-bold text-red-700 mb-0.5">② 30일 미만 공사 사회보험료 전액 삭감</div>
              <div>공사기간 30일 미만 시설공사는 건강보험·국민연금·노인장기요양보험료 대상이 아님. 부당 계상 시 전액 감사 환수 조치 대상.</div>
            </div>
            <div className="border border-gray-300 p-2 rounded">
              <div className="font-bold text-red-700 mb-0.5">③ 수의계약 통합서약서 1종 일원화</div>
              <div>청렴서약서, 수의계약 체결제한 확인서, 조세포탈 확인서 등 10종 서류를 개별 징구하지 말고, 1종의 [수의계약 통합서약서]로 일원화 징구.</div>
            </div>
            <div className="border border-gray-300 p-2 rounded">
              <div className="font-bold text-red-700 mb-0.5">④ 100% 브라우저 로컬 처리 보안 보증</div>
              <div>급여식대, 시트분리, 원가서 분석 등 모든 데이터는 외부 인터넷 서버로 전송되지 않고 사용자 PC 메모리 안에서만 0초 처리됨 (개인정보 보호법 준수).</div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-gray-300 text-center text-[9px] text-gray-500">
            © 2026 AI-SEN STORE (https://www.aisen.store) · 본 가이드는 서울특별시교육청 계약처리지침 및 지방계약법령을 100% 준수합니다.
          </div>
        </div>

      </div>

    </div>
  );
}
