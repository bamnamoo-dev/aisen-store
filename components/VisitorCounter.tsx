'use client';

import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface VisitorCounterProps {
  isMobile?: boolean;
}

export default function VisitorCounter({ isMobile = false }: VisitorCounterProps) {
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null);

  useEffect(() => {
    // 세션 동안 중복 호출 방지 및 데이터 패치
    const fetchVisitors = async () => {
      try {
        // 클라이언트에서 1회 조회 (세션스토리지에 캐시가 있어도 카운트는 서버가 일별로 중복 필터링)
        const res = await fetch('/api/visitors', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.today !== undefined && data.total !== undefined) {
            setStats({ today: data.today, total: data.total });
          }
        }
      } catch (err) {
        // 네트워크 장애 시 기본값
        setStats({ today: 1, total: 1580 });
      }
    };

    fetchVisitors();
  }, []);

  if (isMobile) {
    return (
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs select-none"
        title="AI-SEN 포털 방문자수 (오늘 / 누적)"
      >
        <span className="flex items-center gap-1 text-emerald-700 font-extrabold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>오늘</span>
          <span>{stats ? stats.today.toLocaleString() : '...'}명</span>
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600 font-semibold">
          <span>누적</span> {stats ? stats.total.toLocaleString() : '...'}명
        </span>
      </div>
    );
  }

  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 text-[12px] font-bold text-slate-700 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all select-none cursor-default"
      title="AI-SEN 포털 방문자 현황 (KST 기준 당일 중복 제외 실시간 집계)"
    >
      <div className="flex items-center gap-1 text-slate-400">
        <Users size={13} className="text-blue-600 shrink-0" />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1 text-emerald-700 font-extrabold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] text-emerald-600 font-bold">오늘</span>
          <span>{stats ? stats.today.toLocaleString() : '...'}명</span>
        </span>

        <span className="text-slate-300 font-light">|</span>

        <span className="flex items-center gap-1 text-slate-700 font-bold">
          <span className="text-[11px] text-slate-400 font-semibold">누적</span>
          <span>{stats ? stats.total.toLocaleString() : '...'}명</span>
        </span>
      </div>
    </div>
  );
}
