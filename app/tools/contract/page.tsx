'use client';

import { Compass, BookOpen, Moon, RotateCcw } from 'lucide-react';
import { useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ToolHeader from '@/components/ToolHeader';

function ContractCompassIframe() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const searchParams = useSearchParams();

  const queryString = searchParams ? searchParams.toString() : '';
  const iframeSrc = queryString 
    ? `/tools-src/contract/index.html?${queryString}`
    : '/tools-src/contract/index.html';

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  };

  const handleOpenManual = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        (iframeRef.current.contentWindow as any).openManualModal?.();
      } catch (e) {
        console.error('Failed to open manual modal:', e);
      }
    }
  };

  const handleToggleTheme = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        (iframeRef.current.contentWindow as any).toggleContractTheme?.();
      } catch (e) {
        console.error('Failed to toggle theme:', e);
      }
    }
  };

  const handleResetFlow = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        (iframeRef.current.contentWindow as any).resetContractFlow?.();
      } catch (e) {
        console.error('Failed to reset flow:', e);
      }
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-56px)] md:h-screen bg-slate-900 overflow-hidden relative">
      {/* 겹침 없는 통합 스마트 헤더 (1줄 정렬) */}
      <ToolHeader 
        title="서울교육 계약나침반 (Seoul Education Contract Compass)"
        icon={<Compass size={15} className="text-blue-500" />}
        themeColor="blue"
        onReload={handleReload}
        extraAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleOpenManual}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="계약나침반 실무 사용설명서 열기"
            >
              <BookOpen size={13} className="text-amber-700" />
              <span>사용설명서</span>
            </button>

            <button
              onClick={handleToggleTheme}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="화면 테마 전환 (다크/라이트)"
            >
              <Moon size={13} className="text-slate-600" />
              <span className="hidden sm:inline">테마</span>
            </button>

            <button
              onClick={handleResetFlow}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="모든 입력 초기화 및 1단계로 이동"
            >
              <RotateCcw size={13} className="text-blue-600" />
              <span className="hidden sm:inline">처음부터</span>
            </button>
          </div>
        }
      />

      {/* 계약나침반 100% 풀스크린 뷰어 */}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        title="서울교육 계약나침반"
        className="w-full flex-1 border-none bg-slate-950"
        allow="clipboard-read; clipboard-write; printing"
      />
    </div>
  );
}

export default function ContractCompassPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">계약나침반 로딩 중...</div>}>
      <ContractCompassIframe />
    </Suspense>
  );
}

