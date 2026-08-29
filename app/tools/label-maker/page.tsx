'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw, Tag } from 'lucide-react';
import { useRef } from 'react';

export default function LabelMakerPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = 'https://label-maker-two.vercel.app/';
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-hidden relative">
      
      {/* 상단 미니 포털 컨트롤 바 */}
      <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-violet-600 transition-colors bg-slate-100/80 hover:bg-violet-50 px-2.5 py-1 rounded-lg border border-slate-200"
          >
            <ArrowLeft size={13} />
            <span>메인 포털로 돌아가기</span>
          </Link>

          <div className="h-3.5 w-[1px] bg-slate-200"></div>

          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
              <Tag size={13} />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
              증빙서 측면표지 라벨 제작기
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="btn-secondary py-1 px-2 text-xs font-bold text-slate-600 flex items-center gap-1 hover:bg-slate-50"
            title="새로고침"
          >
            <RefreshCw size={12} />
            <span className="hidden sm:inline">새로고침</span>
          </button>
        </div>
      </div>

      {/* 원본 웹앱 100% 풀스크린 뷰어 */}
      <iframe
        ref={iframeRef}
        src="https://label-maker-two.vercel.app/"
        title="증빙서 측면표지 제작기"
        className="w-full flex-1 border-none bg-slate-50"
        allow="clipboard-read; clipboard-write; printing"
      />

    </div>
  );
}
