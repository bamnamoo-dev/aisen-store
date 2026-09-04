'use client';

import { Calculator, MessageSquare } from 'lucide-react';
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

  return (
    <div className="w-full flex flex-col h-[calc(100vh-56px)] md:h-screen bg-slate-900 overflow-hidden relative">
      
      {/* 겹침 없는 통합 스마트 헤더 */}
      <ToolHeader 
        title="스마트 원가계산서 검증기 (AI-SEN Cost Audit)"
        icon={<Calculator size={15} className="text-blue-500" />}
        themeColor="blue"
        onReload={handleReload}
        extraAction={
          <Link
            href="/board"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shadow-2xs"
            title="실무 질의응답 및 서식 제보 소통 게시판"
          >
            <MessageSquare size={13} className="text-blue-500" />
            <span>소통 게시판</span>
          </Link>
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
