'use client';

import { Calculator } from 'lucide-react';
import { useRef } from 'react';
import ToolHeader from '@/components/ToolHeader';

export default function CostAuditPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = '/tools-src/cost-audit/index.html';
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
      />

      {/* 원본 웹앱 100% 풀스크린 뷰어 */}
      <iframe
        ref={iframeRef}
        src="/tools-src/cost-audit/index.html"
        title="스마트 원가계산서 검증기"
        className="w-full flex-1 border-none bg-slate-950"
        allow="clipboard-read; clipboard-write; printing"
      />

    </div>
  );
}
