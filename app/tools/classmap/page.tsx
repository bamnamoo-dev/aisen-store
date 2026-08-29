'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, Grid, Sparkles, RefreshCw } from 'lucide-react';
import { useRef } from 'react';

export default function ClassmapPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = '/tools-src/classmap/index.html';
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
      
      {/* 상단 얇은 컨트롤 바 */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-cyan-600 transition-colors bg-slate-50 hover:bg-cyan-50 px-2.5 py-1.5 rounded-lg border border-slate-200"
          >
            <ArrowLeft size={14} />
            <span>메인 포털로 돌아가기</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
              <Grid size={14} />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900">
              스마트 교실 배치도 (Smart Classmap)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="btn-secondary py-1 px-2.5 text-xs font-bold text-slate-600 flex items-center gap-1 hover:bg-slate-50"
            title="새로고침"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">새로고침</span>
          </button>
          <a
            href="/tools-src/classmap/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-1 px-2.5 text-xs font-bold text-cyan-700 border-cyan-200 hover:bg-cyan-50 flex items-center gap-1"
            title="전체화면 새 탭 열기"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">새 탭 전체화면</span>
          </a>
        </div>
      </header>

      {/* 원본 1:1 완벽 구동 인라인 뷰어 */}
      <main className="flex-1 w-full h-full relative bg-slate-50">
        <iframe
          ref={iframeRef}
          src="/tools-src/classmap/index.html"
          title="스마트 교실 배치도"
          className="w-full h-full border-none"
          allow="clipboard-read; clipboard-write; printing"
        />
      </main>

    </div>
  );
}
