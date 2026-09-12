'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileCheck, 
  Search, 
  Download, 
  Eye, 
  Copy, 
  Check, 
  X, 
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import ToolHeader from '@/components/ToolHeader';

// =============================================================================
// 타입 정의
// =============================================================================
interface FormCategory {
  id: string;
  name: string;
  badge: string;
}

interface FormItem {
  id: string;
  category_id: string;
  form_no: string;
  title: string;
  page: number;
  pdf_file: string;
  hwp_file: string;
  category: string;
  file_type: string;
  tags: string[];
}

interface CatalogData {
  version: string;
  total_count: number;
  categories: FormCategory[];
  items: FormItem[];
}

// =============================================================================
// 한글 초성 검색 알고리즘
// =============================================================================
const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

function getChosung(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code >= 0 && code <= 11171) {
      result += CHOSUNG[Math.floor(code / 588)];
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}

function isChosungMatch(target: string, query: string): boolean {
  if (!query) return true;
  const lowerTarget = target.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // 1. 일반 텍스트 포함 여부
  if (lowerTarget.includes(lowerQuery)) return true;

  // 2. 초성 매칭 여부
  const targetChosung = getChosung(lowerTarget);
  const queryChosung = getChosung(lowerQuery);
  return targetChosung.includes(queryChosung);
}

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function FormsPage() {
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'hwpx' | 'pdf'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<FormItem | null>(null);

  // 데이터 로드 (public/forms/forms_catalog.json)
  useEffect(() => {
    async function loadForms() {
      try {
        const res = await fetch('/forms/forms_catalog.json');
        if (!res.ok) {
          throw new Error('카탈로그를 불러오지 못했습니다.');
        }
        const data: CatalogData = await res.json();
        setCatalog(data);
      } catch (err) {
        console.error('서식 데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    }
    loadForms();
  }, []);

  // 서식명 복사 핸들러
  const handleCopyTitle = (id: string, title: string, formNo: string) => {
    const textToCopy = `${formNo} ${title}`.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // 필터링된 서식 목록 산출
  const filteredItems = useMemo(() => {
    if (!catalog) return [];
    
    return catalog.items.filter((item) => {
      // 1. 카테고리 필터
      if (activeCategory !== 'all' && item.category_id !== activeCategory) {
        return false;
      }

      // 2. 포맷 필터
      if (formatFilter === 'hwpx' && !item.hwp_file) return false;
      if (formatFilter === 'pdf' && !item.pdf_file) return false;

      // 3. 검색어 필터 (제목, 서식번호, 태그, 초성)
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const matchTitle = isChosungMatch(item.title, q);
        const matchFormNo = item.form_no.toLowerCase().includes(q.toLowerCase());
        const matchTags = item.tags.some(tag => isChosungMatch(tag, q));
        if (!matchTitle && !matchFormNo && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [catalog, activeCategory, formatFilter, searchQuery]);

  // 카테고리별 실시간 카운트
  const categoryCounts = useMemo(() => {
    if (!catalog) return {};
    const counts: Record<string, number> = { all: catalog.items.length };
    catalog.items.forEach(item => {
      counts[item.category_id] = (counts[item.category_id] || 0) + 1;
    });
    return counts;
  }, [catalog]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* 1. 통일된 최상단 툴 헤더 */}
      <ToolHeader
        title="AI-SEN 행정서식 서고"
        icon={<FileCheck className="text-blue-600" size={16} />}
        themeColor="blue"
        extraAction={
          <Link
            href="/board"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100/90 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
          >
            질의게시판
          </Link>
        }
      />

      {/* 2. 상단 브리핑 & 통계 히어로 배너 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles size={12} className="text-blue-600" />
                  서울교육 표준 행정서식 통합 서고
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ⚡ 0초 즉시 다운로드
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                AI-SEN 교육행정 표준 서식 라이브러리
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                서울특별시교육청 공무원 인사·복무, 계약, 학교 제증명, 교원 서식 등 총 <strong className="text-blue-600 font-bold">{catalog?.total_count || 71}종</strong>을 실시간 미리보기 및 원클릭 HWPX/PDF로 다운로드합니다.
              </p>
            </div>

            {/* 우측 빠른 통계 배지 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-center">
                <div className="text-[11px] font-bold text-slate-500">등록 서식</div>
                <div className="text-lg font-black text-blue-600">{catalog?.total_count || 71}종</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-center">
                <div className="text-[11px] font-bold text-slate-500">검색 결과</div>
                <div className="text-lg font-black text-slate-800">{filteredItems.length}건</div>
              </div>
            </div>
          </div>

          {/* 3. 스마트 검색창 (초성 검색 & 클리어) */}
          <div className="mt-5 sm:mt-6">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 sm:left-4 text-slate-400 pointer-events-none" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="서식명, 서식번호([서식 1]), 태그, 초성(예: ㅎㅈㅇ ➔ 휴직원) 검색..."
                className="w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-medium text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="검색어 지우기"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* 4. 카테고리 탭 스크롤 바 */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            {catalog?.categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 5. 포맷 필터 칩 & 결과 상태 바 */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-500">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <span>포맷 필터:</span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-1">
                <button
                  onClick={() => setFormatFilter('all')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    formatFilter === 'all'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFormatFilter('hwpx')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    formatFilter === 'hwpx'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  한글 (HWPX)
                </button>
                <button
                  onClick={() => setFormatFilter('pdf')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    formatFilter === 'pdf'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  PDF 문서
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              {searchQuery ? (
                <span>&apos;<strong className="text-blue-600">{searchQuery}</strong>&apos; 검색 결과 <strong>{filteredItems.length}</strong>개</span>
              ) : (
                <span>선택 카테고리 <strong>{filteredItems.length}</strong>개 서식 표시 중</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. 메인 본문: 서식 카드 그리드 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold">행정서식 목록을 불러오는 중...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
            <FolderOpen className="mx-auto text-slate-300 mb-3" size={40} />
            <h3 className="text-base font-bold text-slate-700">검색된 행정서식이 없습니다.</h3>
            <p className="text-xs text-slate-400 mt-1">
              검색어나 필터를 변경해 보세요. (예: 초성 검색 &apos;ㅎㅈㅇ&apos;, &apos;복직&apos;, &apos;서약서&apos;)
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); setFormatFilter('all'); }}
              className="mt-4 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredItems.map((item) => {
              // 실제 정적 파일 경로 생성 (/forms/공무원/[서식 1] 휴직원.hwpx)
              const hwpxUrl = `/forms/${encodeURIComponent(item.category)}/${encodeURIComponent(item.hwp_file)}`;
              const pdfUrl = `/forms/${encodeURIComponent(item.category)}/${encodeURIComponent(item.pdf_file)}`;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* 카드 상단 헤더 스트라이프 & 태그 */}
                  <div>
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <div className="p-3.5 sm:p-4 pb-2">
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="inline-flex items-center text-[10.5px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {item.form_no}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.page}쪽
                          </span>
                          <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase">
                            {item.file_type}
                          </span>
                        </div>
                      </div>

                      {/* 서식 제목 */}
                      <h3 
                        className="text-sm sm:text-[14.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2"
                        title={item.title}
                      >
                        {item.title}
                      </h3>

                      {/* 태그 모음 */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            onClick={() => setSearchQuery(tag)}
                            className="text-[10px] text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 px-1.5 py-0.5 rounded border border-slate-200/80 cursor-pointer transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 카드 하단 액션 버튼 그룹 */}
                  <div className="p-3 sm:p-3.5 pt-2 bg-slate-50/70 border-t border-slate-100 mt-2">
                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                      {/* 1. HWPX 원클릭 다운로드 */}
                      <a
                        href={hwpxUrl}
                        download={item.hwp_file}
                        className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-2 rounded-lg transition-colors shadow-2xs cursor-pointer active:scale-95"
                        title="한글(HWPX) 원클릭 즉시 다운로드"
                      >
                        <Download size={13} />
                        <span>HWP 받기</span>
                      </a>

                      {/* 2. PDF 미리보기 (모바일: 100% 팝업차단 없는 네이티브 새 탭 / PC: 편리한 인라인 모달) */}
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                            e.preventDefault();
                            setPreviewModal(item);
                          }
                        }}
                        className="flex items-center justify-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold py-1.5 px-2 rounded-lg transition-colors shadow-2xs cursor-pointer active:scale-95"
                        title="PDF 서식 미리보기"
                      >
                        <Eye size={13} className="text-slate-500" />
                        <span>미리보기</span>
                      </a>
                    </div>

                    {/* 3. 서식명 복사 버튼 (공문서 기안용) */}
                    <button
                      onClick={() => handleCopyTitle(item.id, item.title, item.form_no)}
                      className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 py-1 rounded transition-colors cursor-pointer active:scale-95"
                      title="공문 기안용 서식명 클립보드 복사"
                    >
                      {isCopied ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span className="text-emerald-600">서식명 복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>기안용 서식명 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 7. PDF 미리보기 모달 */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden">
            {/* 모달 상단 헤더 */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {previewModal.form_no}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {previewModal.title}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* 새 창 열기 */}
                <a
                  href={`/forms/${encodeURIComponent(previewModal.category)}/${encodeURIComponent(previewModal.pdf_file)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="새 창에서 원본 열기"
                >
                  <ExternalLink size={16} />
                </a>
                {/* 닫기 버튼 */}
                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="닫기"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 모달 본문: PDF 뷰어 및 모바일 폴백 */}
            <div className="flex-1 bg-slate-100 relative flex flex-col">
              <div className="sm:hidden bg-blue-50 px-3 py-2 text-xs text-blue-700 flex items-center justify-between border-b border-blue-100">
                <span>모바일에서는 전체화면 뷰어로 최적화됩니다.</span>
                <a
                  href={`/forms/${encodeURIComponent(previewModal.category)}/${encodeURIComponent(previewModal.pdf_file)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-blue-700 flex items-center gap-0.5"
                >
                  <span>전체화면 열기</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <iframe
                src={`/forms/${encodeURIComponent(previewModal.category)}/${encodeURIComponent(previewModal.pdf_file)}#toolbar=1`}
                className="w-full flex-1 border-none"
                title={previewModal.title}
              />
            </div>

            {/* 모달 하단 툴바 */}
            <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                총 {previewModal.page}쪽 분량 | {previewModal.category}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`/forms/${encodeURIComponent(previewModal.category)}/${encodeURIComponent(previewModal.hwp_file)}`}
                  download={previewModal.hwp_file}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  <Download size={13} />
                  <span>한글(.hwpx) 다운로드</span>
                </a>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. 하단 안내 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            AI-SEN STORE 행정서식 서고 • 서울특별시교육청 교육행정 공무원 및 교직원 지원용
          </span>
          <span className="text-[11px] text-slate-400">
            문서 서식 오류 및 추가 요청은 <Link href="/board" className="text-blue-600 underline font-bold">소통게시판</Link>을 이용해 주세요.
          </span>
        </div>
      </footer>
    </div>
  );
}
