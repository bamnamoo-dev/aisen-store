'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Filter,
  CheckCircle2,
  Sliders,
  Share2,
  Building,
  Calendar,
  Layers,
  ArrowLeft,
  Bot,
  FileCheck
} from 'lucide-react';
import ToolHeader from '@/components/ToolHeader';

// =============================================================================
// 타입 인터페이스 정의
// =============================================================================
interface SourceGuide {
  guide_text?: string;
  system_name?: string;
  menu_path?: string;
  search_how_to?: string;
  document_type?: string;
  drafting_action?: string;
}

interface DraftTemplate {
  id: string;
  number: number;
  category: '교무학사' | '행정' | string;
  sub_category: string;
  title: string;
  document_type: string;
  body_template: string;
  original_source_guide?: SourceGuide;
  instructions_for_ai?: string;
  keywords?: string[];
}

export default function DraftHelperPage() {
  // 1. 상태 관리
  const [templates, setTemplates] = useState<DraftTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 검색 및 필터
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'전체' | '교무학사' | '행정'>('전체');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('전체');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // 모바일 탭 뷰 (목록 ↔ 기안문)
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

  // 스마트 인라인 치환 변수
  const [schoolName, setSchoolName] = useState('서울○○초등학교');
  const [targetYear, setTargetYear] = useState('2026');
  const [deptName, setDeptName] = useState('교육과정부');
  const [docNum, setDocNum] = useState('0000');

  // 복사 피드백 & 모달
  const [copied, setCopied] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // 2. 데이터 비동기 로드
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/data/edufine_templates_seoul.json');
        if (!res.ok) {
          throw new Error('서식 데이터를 불러오지 못했습니다.');
        }
        const data: DraftTemplate[] = await res.json();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateId(data[0].id);
        }
      } catch (err: any) {
        console.error('Data load error:', err);
        setError(err.message || '데이터 로딩 중 오류 발생');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 3. 소분류 카테고리 목록 추출
  const subCategories = useMemo(() => {
    const subs = new Set<string>();
    templates.forEach((t) => {
      if (selectedCategory === '전체' || t.category === selectedCategory) {
        subs.add(t.sub_category);
      }
    });
    return ['전체', ...Array.from(subs)];
  }, [templates, selectedCategory]);

  // 대분류 변경 시 소분류 초기화
  const handleCategoryChange = (cat: '전체' | '교무학사' | '행정') => {
    setSelectedCategory(cat);
    setSelectedSubCategory('전체');
  };

  // 4. 필터링된 템플릿 목록
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return templates.filter((t) => {
      const matchCat = selectedCategory === '전체' || t.category === selectedCategory;
      const matchSub = selectedSubCategory === '전체' || t.sub_category === selectedSubCategory;
      const matchQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.sub_category.toLowerCase().includes(q) ||
        (t.keywords && t.keywords.some((k) => k.toLowerCase().includes(q))) ||
        (t.body_template && t.body_template.toLowerCase().includes(q));

      return matchCat && matchSub && matchQuery;
    });
  }, [templates, selectedCategory, selectedSubCategory, searchQuery]);

  // 5. 현재 선택된 템플릿
  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || filteredTemplates[0] || null;
  }, [templates, selectedTemplateId, filteredTemplates]);

  // 6. 스마트 치환된 본문 계산
  const renderedBody = useMemo(() => {
    if (!activeTemplate) return '';
    let body = activeTemplate.body_template;

    // 학교명 치환: 단일 패스(Single-Pass) 정규식으로 치환하여 결과물 내 재치환(예: 서울서울) 방지
    if (schoolName.trim()) {
      const sName = schoolName.trim();
      body = body.replace(/○○○○학교(장|운영위원회|의)?|○○초등학교|○○중학교|○○고등학교|○○학교/g, (match, suffix) => {
        return suffix ? `${sName}${suffix}` : sName;
      });
    }

    // 연도 치환
    if (targetYear.trim()) {
      const y = targetYear.trim();
      body = body.replace(/2026(학년도|년도|년|\.)/g, (match, suffix) => `${y}${suffix}`);
    }

    // 부서명 치환
    if (deptName.trim()) {
      const dName = deptName.trim();
      body = body.replace(/○○○○과|○○○○부|○○과/g, dName);
    }

    // 문서번호 치환
    if (docNum.trim()) {
      body = body.replace(/-0000\(/g, `-${docNum.trim()}(`);
    }

    return body;
  }, [activeTemplate, schoolName, targetYear, deptName, docNum]);

  // 7. 클립보드 복사 핸들러
  const handleCopy = async () => {
    if (!renderedBody) return;
    try {
      await navigator.clipboard.writeText(renderedBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = renderedBody;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 치환 변수 초기화
  const handleResetVariables = () => {
    setSchoolName('서울○○초등학교');
    setTargetYear('2026');
    setDeptName('교육과정부');
    setDocNum('0000');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      {/* 1. 최상단 ToolHeader */}
      <ToolHeader
        title="AI-SEN 기안문 (K-에듀파인 237종)"
        icon={<FileText className="text-blue-600" size={16} />}
        themeColor="blue"
        extraAction={
          <div className="flex items-center gap-1 sm:gap-2">
            {/* 엑셀 일괄 다운로드 버튼 */}
            <a
              href="/data/edufine_237_templates.xlsx"
              download="K_에듀파인_공식표준_기안서식_237종_서울최적화.xlsx"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="237종 전체 서식 마스터 엑셀 다운로드"
            >
              <Download size={13} />
              <span className="hidden md:inline">237종 마스터 엑셀</span>
            </a>

            {/* 행정서식 71종 서고 바로가기 */}
            <Link
              href="/forms"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="인사·복무 71종 HWPX 행정서식함 바로가기"
            >
              <FileCheck size={13} />
              <span className="hidden md:inline">행정서식 71종</span>
            </Link>

            {/* 이용안내 & 출처 모달 버튼 */}
            <button
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="이용안내 및 법적 출처 표기"
            >
              <Info size={13} />
              <span className="hidden sm:inline">이용안내</span>
            </button>

            {/* AI 챗봇 바로가기 */}
            <a
              href="https://chatbot.aisen.store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="AI 챗봇에서 기안문 자동 생성하기"
            >
              <Bot size={13} />
              <span className="hidden sm:inline">AI 챗봇</span>
            </a>
          </div>
        }
      />

      {/* 모바일 탭 토글 바 (390px 스마트폰 대응) */}
      <div className="lg:hidden flex border-b border-slate-200 bg-white shrink-0">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Filter size={13} />
          서식 탐색 ({filteredTemplates.length})
        </button>
        <button
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'detail'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={13} />
          기안문 편집·복사
        </button>
      </div>

      {/* 2. 메인 2열 스플릿 워크스페이스 */}
      <div className="flex-1 flex overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3">
        {/* =================================================================== */}
        {/* 좌측 패널: 서식 탐색 & 237종 목록 (데스크톱 380px ~ 440px 고정) */}
        {/* =================================================================== */}
        <div
          className={`w-full lg:w-[420px] shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden ${
            mobileTab === 'detail' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* 상단 검색바 & 대분류 탭 */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70 shrink-0 space-y-2.5">
            {/* 옴니 검색창 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="서식명, 업무, 키워드 검색 (예: 현장체험학습, 학운위, 위탁)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 대분류 세그먼트 (전체 / 교무학사 / 행정) */}
            <div className="flex p-1 bg-slate-200/70 rounded-xl text-xs font-bold">
              {(['전체', '교무학사', '행정'] as const).map((cat) => {
                const count =
                  cat === '전체'
                    ? templates.length
                    : templates.filter((t) => t.category === cat).length;
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat} <span className="text-[11px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* 27개 소분류 가로 스크롤 칩 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-[11.5px]">
              {subCategories.map((sub) => {
                const isActive = selectedSubCategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 서식 목록 (가상 스크롤 뷰) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y-0">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-20">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium">237종 공식 표준 서식 로딩 중...</span>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20 gap-2">
                <FileText size={32} className="opacity-40" />
                <span className="text-xs font-medium">검색 조건과 일치하는 서식이 없습니다.</span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('전체');
                    setSelectedSubCategory('전체');
                  }}
                  className="text-xs text-blue-600 font-bold underline"
                >
                  필터 전체 초기화
                </button>
              </div>
            ) : (
              filteredTemplates.map((item) => {
                const isSelected = item.id === selectedTemplateId;
                const isEdu = item.category === '교무학사';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedTemplateId(item.id);
                      setMobileTab('detail');
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400/50 shadow-2xs'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    {/* 상단 메타 정보 */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10.5px] px-2 py-0.5 rounded-md font-bold border ${
                            isEdu
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {item.sub_category}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                          {item.document_type || '내부결재'}
                        </span>
                      </div>
                      <span className="text-[10.5px] font-mono font-bold text-slate-400">
                        #{String(item.number).padStart(3, '0')}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="font-bold text-xs sm:text-[13px] text-slate-800 leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                );
              })
            )}
          </div>

          {/* 목록 하단 카운트 요약 */}
          <div className="p-2.5 px-3.5 bg-slate-50 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between shrink-0">
            <span>
              조회 결과: <strong className="text-slate-800 font-bold">{filteredTemplates.length}</strong> / 237종
            </span>
            <span className="text-blue-600 font-bold">서울형 최적화 v1.0</span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 우측 패널: 스마트 기안문 편집 & K-에듀파인 1초 복사 작업대 */}
        {/* =================================================================== */}
        <div
          className={`flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden ${
            mobileTab === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeTemplate ? (
            <>
              {/* 1. 작업대 헤더: 제목 및 메타정보 */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 모바일 뒤로가기 버튼 */}
                    <button
                      onClick={() => setMobileTab('list')}
                      className="lg:hidden inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200"
                    >
                      <ArrowLeft size={13} />
                      목록
                    </button>

                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {activeTemplate.category} &gt; {activeTemplate.sub_category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {activeTemplate.document_type || '내부결재'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      서식 번호 #{String(activeTemplate.number).padStart(3, '0')}
                    </span>
                  </div>

                  {/* 챗봇 연계 버튼 */}
                  <a
                    href={`https://chatbot.aisen.store?q=${encodeURIComponent(
                      `${activeTemplate.title} 기안문 작성해줘`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Sparkles size={12} />
                    챗봇에서 살붙이기
                  </a>
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  {activeTemplate.title}
                </h2>
              </div>

              {/* 2. ✨ 1초 스마트 인라인 치환 바 (사용자 맞춤 변수) */}
              <div className="p-3 sm:px-4 bg-blue-50/40 border-b border-blue-100 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                    <Sparkles size={13} className="text-blue-600" />
                    <span>스마트 인라인 1초 치환 (입력 시 본문 자동 반영)</span>
                  </div>
                  <button
                    onClick={handleResetVariables}
                    className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                    title="기본값으로 되돌리기"
                  >
                    <RotateCcw size={11} />
                    초기화
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">내 학교명</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="서울○○초등학교"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">기안 학년도</label>
                    <input
                      type="text"
                      value={targetYear}
                      onChange={(e) => setTargetYear(e.target.value)}
                      placeholder="2026"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">담당 부서/과</label>
                    <input
                      type="text"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="교육과정부"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">문서 번호</label>
                    <input
                      type="text"
                      value={docNum}
                      onChange={(e) => setDocNum(e.target.value)}
                      placeholder="0000"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 3. 에듀파인 본문 뷰어 영역 (맑은 고딕 공문서 서식 규격) */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 bg-slate-50/50">
                <div className="max-w-4xl mx-auto space-y-4">
                  {/* 공문서 뷰어 박스 */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-7 relative font-sans leading-relaxed text-slate-900 selection:bg-blue-100">
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold">
                        K-에듀파인 규격 (맑은 고딕 12pt)
                      </span>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-xs sm:text-[13.5px] leading-relaxed text-slate-800 break-words tracking-normal">
                      {renderedBody}
                    </pre>
                  </div>

                  {/* K-에듀파인 상신 팁 아코디언 */}
                  {activeTemplate.original_source_guide && (
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
                      <button
                        onClick={() => setShowTips(!showTips)}
                        className="w-full p-3 px-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 text-blue-700 font-extrabold">
                          <BookOpen size={14} />
                          K-에듀파인 원문 확인 경로 및 실무 팁 (클릭하여 펼치기)
                        </span>
                        <span className="text-slate-400 text-xs font-semibold">{showTips ? '접기 ▲' : '열기 ▼'}</span>
                      </button>

                      {showTips && (
                        <div className="p-4 bg-white border-t border-slate-100 space-y-2 text-slate-600 leading-relaxed">
                          <p className="font-semibold text-slate-800">
                            📍 <strong>메뉴 경로</strong>: {activeTemplate.original_source_guide.menu_path}
                          </p>
                          <p>
                            🔍 <strong>검색 방법</strong>: {activeTemplate.original_source_guide.search_how_to}
                          </p>
                          <p className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                            💡 <strong>서식 깨짐 방지 꿀팁</strong>: 에듀파인 본문 클릭 후 단축키{' '}
                            <kbd className="px-1 py-0.5 bg-white border rounded font-mono font-bold">Ctrl+Alt+V</kbd> ➔
                            &apos;텍스트 형식&apos;으로 골라 붙이시면 맑은 고딕 서식이 완벽하게 유지됩니다.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. 작업대 하단 고정 액션 바 */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>서울시교육청 실무 최적화 서식</span>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  {/* 복사 버튼 (메인 킬러 액션) */}
                  <button
                    onClick={handleCopy}
                    className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white transition-all shadow-md cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-300'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        복사 완료! (에듀파인에 바로 붙여넣으세요)
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        📋 K-에듀파인용 1초 복사
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="opacity-30 mb-2" />
              <p className="text-sm font-medium">좌측 목록에서 서식을 선택해 주세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. 하단 투명 출처 & 공공누리 배너 */}
      <footer className="h-7 bg-slate-100 border-t border-slate-200/80 px-3 flex items-center justify-between text-[10.5px] text-slate-500 shrink-0">
        <div className="truncate">
          🏛️ <strong>자료 출처</strong>: 인천광역시교육청학교지원단 교원업무지원과 (공공누리 제1유형) 기반 + 서울특별시교육청 실무 최적화
        </div>
        <div className="hidden sm:inline font-mono">
          © 2026 AI-SEN STORE • 공문서 표준 규격 준수
        </div>
      </footer>

      {/* =================================================================== */}
      {/* 4. 이용안내 & 법적 출처 모달 */}
      {/* =================================================================== */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                🏛️ AI-SEN 기안문 도우미 이용안내 및 출처
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 text-blue-900 space-y-1">
                <p className="font-extrabold text-sm">💡 K-에듀파인 237종 공식 서식이란?</p>
                <p>
                  시·도교육청 K-에듀파인 시스템에 공식 등록된 교무학사(108종) 및 행정(129종) 총 237종의 표준 샘플 서식입니다.
                  행정안전부 공문서 서식 규격(1. 관련, 가. 나., 붙임 끝)에 맞춰 작성되어 있어 에듀파인에 즉시 결재 상신할 수 있습니다.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  스마트 1초 인라인 치환 사용법
                </h4>
                <p>
                  상단의 [내 학교명], [기안 학년도], [담당 부서], [문서 번호] 칸에 값을 입력하시면, 본문 서식의 자리표시자(○○○○학교, 2026학년도 등)가 실시간으로 일괄 교체되어 즉시 내 학교 기안문으로 완성됩니다.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  에듀파인 복사 꿀팁 (글꼴 깨짐 0%)
                </h4>
                <p>
                  <strong>[📋 K-에듀파인용 1초 복사]</strong> 버튼을 누른 뒤, K-에듀파인 웹 기안기 본문 창에서 <kbd className="px-1 py-0.5 bg-slate-100 border rounded font-mono font-bold">Ctrl+Alt+V</kbd>를 눌러 &apos;텍스트 형식&apos;으로 붙여넣으시면 맑은 고딕 서식이 100% 온전하게 유지됩니다.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                <h4 className="font-bold text-slate-800 text-xs">⚖️ 법적 근거 및 공공누리 출처 표기</h4>
                <p>
                  • <strong>원천 출처</strong>: 인천광역시교육청학교지원단 교원업무지원과 (2026. 9.)
                </p>
                <p>
                  • <strong>저작권 규정</strong>: 대한민국 저작권법 제7조(보호받지 못하는 저작물: 공문서 및 고시) 및 공공누리 제1유형(출처표시·자유이용·2차적 저작물 작성 허용)을 엄격히 준수합니다.
                </p>
                <p>
                  • <strong>최적화</strong>: 본 서식은 서울특별시교육청 관내 학교 및 교육행정 실무 환경에 맞추어 맞춤 정제(서울형 최적화)되었습니다.
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
