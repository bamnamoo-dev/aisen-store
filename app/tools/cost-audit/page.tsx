'use client';

import { Calculator, MessageSquare, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import ToolHeader from '@/components/ToolHeader';
import { supabase } from '@/lib/supabase';

export default function CostAuditPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState('/tools-src/cost-audit/index.html');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (email) {
        setIframeSrc(`/tools-src/cost-audit/index.html?email=${encodeURIComponent(email)}`);
      }
    };
    checkAuth();
  }, []);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  };

  const handleOpenManual = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        (iframeRef.current.contentWindow as any).openManualModal();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-56px)] md:h-screen bg-slate-900 overflow-hidden relative">
      
      {/* 겹침 없는 통합 스마트 헤더 */}
      <ToolHeader 
        title="스마트 원가계산서 검증기 (AI-SEN Cost Audit)"
        icon={<Calculator size={15} className="text-blue-500" />}
        themeColor="blue"
        onReload={handleReload}
        extraAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleOpenManual}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="원가계산서 검증기 실무 사용설명서 열기"
            >
              <BookOpen size={13} className="text-amber-700" />
              <span>사용설명서</span>
            </button>

            <Link
              href="/board"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shadow-2xs"
              title="실무 질의응답 및 서식 제보 소통 게시판"
            >
              <MessageSquare size={13} className="text-blue-500" />
              <span className="hidden sm:inline">소통 게시판</span>
            </Link>
          </div>
        }
      />

      {/* 원본 웹앱 100% 풀스크린 뷰어 */}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        title="스마트 원가계산서 검증기"
        className="w-full flex-1 border-none bg-slate-950"
        allow="clipboard-read; clipboard-write; printing"
      />

    </div>
  );
}
