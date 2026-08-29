'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, RefreshCw, Trophy } from 'lucide-react';
import { useRef } from 'react';

export default function WatermelonGamePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = '/tools-src/watermelon/index.html';
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
      
      {/* 상단 얇은 컨트롤 바 */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-slate-200"
          >
            <ArrowLeft size={14} />
            <span>메인 포털로 돌아가기</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <span className="text-base">🍉</span>
            <span className="text-xs sm:text-sm font-black text-slate-900">
              행정 힐링 수박 게임 (Suika Game)
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
            href="/tools-src/watermelon/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-1 px-2.5 text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50 flex items-center gap-1"
            title="전체화면 새 탭 열기"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">새 탭 전체화면</span>
          </a>
        </div>
      </header>

      {/* 원본 1:1 완벽 구동 인라인 뷰어 */}
      <main className="flex-1 w-full h-full relative bg-slate-900">
        <iframe
          ref={iframeRef}
          src="/tools-src/watermelon/index.html"
          title="행정 힐링 수박 게임"
          className="w-full h-full border-none"
          allow="clipboard-read; clipboard-write; autoplay"
        />
      </main>

    </div>
  );
}
