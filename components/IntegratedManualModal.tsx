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
        className="bg-white w-full max-w-[960px] max-h-[86vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 tracking-tight">AI-SEN 포털 &amp; 기능별 이용안내</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200/60">
                  간편 가이드
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">메인 포털 개요 및 15대 전문 행정 도구 탭별 핵심 안내</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 독립 전체화면 라우트 이동 */}
            <Link
              href="/guide"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs"
              title="새 탭에서 전체화면으로 열기"
            >
              <ExternalLink size={13} />
              <span>새 창에서 보기</span>
            </Link>

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="닫기 (ESC)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 모달 본문 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50/30">
          <ManualContent onToolClick={onClose} isModal={true} />
        </div>
      </div>
    </div>
  );
}
