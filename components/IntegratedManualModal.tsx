'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, ExternalLink, BookOpen, Printer } from 'lucide-react';
import ManualContent from './ManualContent';

interface IntegratedManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntegratedManualModal({ isOpen, onClose }: IntegratedManualModalProps) {
  // ESC 키 닫기 & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-[95vw] max-w-[1360px] h-[92vh] max-h-[960px] rounded-3xl shadow-2xl flex flex-col border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">AI-SEN 포털 &amp; 기능별 이용안내</h2>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  간편 가이드
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">서울특별시교육청 메인 포털 개요 및 15대 전문 행정 도구 핵심 가이드</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 독립 전체화면 라우트 이동 */}
            <Link
              href="/guide"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
              title="새 탭에서 전체화면으로 열기"
            >
              <ExternalLink size={15} />
              <span>새 창에서 보기</span>
            </Link>

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
              title="닫기 (ESC)"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 모달 본문 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-8 custom-scrollbar bg-slate-50/30">
          <ManualContent onToolClick={onClose} isModal={true} />
        </div>
      </div>
    </div>
  );
}
