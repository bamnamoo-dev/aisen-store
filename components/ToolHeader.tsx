'use client';

import Link from 'next/link';
import { ArrowLeft, Menu, RefreshCw, House } from 'lucide-react';
import { useSidebar } from './SidebarContext';

interface ToolHeaderProps {
  title: string;
  icon: React.ReactNode;
  themeColor?: string; // e.g. 'rose', 'pink', 'cyan', 'violet', 'emerald', 'orange'
  onReload?: () => void;
}

export default function ToolHeader({ title, icon, themeColor = 'blue', onReload }: ToolHeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-11 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 shadow-2xs">
      
      {/* 좌측: 메뉴 펼치기 + 포털 홈 바로가기 + 도구 타이틀 (절대 겹치지 않게 한 줄로 정렬) */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* 1. 사이드 메뉴 토글 버튼 */}
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100/90 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
          title="사이드 메뉴 열기/닫기"
        >
          <Menu size={14} />
          <span className="hidden sm:inline">전체메뉴</span>
        </button>

        {/* 2. 메인 포털 홈으로 이동 버튼 */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100/90 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
          title="메인 포털 홈으로 가기"
        >
          <House size={13} />
          <span>홈으로</span>
        </Link>

        <div className="h-3.5 w-[1px] bg-slate-200 mx-0.5"></div>

        {/* 3. 현재 도구 타이틀 */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center font-bold text-xs">
            {icon}
          </div>
          <span className="text-xs sm:text-[13.5px] font-black text-slate-800 tracking-tight truncate max-w-[180px] sm:max-w-none">
            {title}
          </span>
        </div>

      </div>

      {/* 우측: 새로고침 버튼 */}
      {onReload && (
        <div className="flex items-center gap-2">
          <button
            onClick={onReload}
            className="btn-secondary py-1 px-2 text-xs font-bold text-slate-600 flex items-center gap-1 hover:bg-slate-50"
            title="새로고침"
          >
            <RefreshCw size={12} />
            <span className="hidden sm:inline">새로고침</span>
          </button>
        </div>
      )}

    </header>
  );
}
