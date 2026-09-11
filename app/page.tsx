'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Bot, 
  Navigation, 
  Search, 
  ChevronRight, 
  ArrowRight,
  ArrowUpRight,
  MessageSquareShare,
  FolderOpen,
  LayoutDashboard,
  Tag,
  LayoutGrid,
  FileSpreadsheet,
  UtensilsCrossed,
  Calculator,
  FileCheck,
  ChartPie,
  ShieldCheck,
  Compass,
  BookOpen,
  Sparkles
} from 'lucide-react';
import IntegratedManualModal from '@/components/IntegratedManualModal';

type CategoryId = 'all' | 'ai' | 'finance' | 'admin' | 'facility';

interface CategoryTab {
  id: CategoryId;
  label: string;
  count: number;
  colorClass: string;
  activeClass: string;
}

const CATEGORIES: CategoryTab[] = [
  { 
    id: 'all', 
    label: '전체', 
    count: 15, 
    colorClass: 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200', 
    activeClass: 'bg-slate-900 text-white border-slate-900 shadow-xs' 
  },
  { 
    id: 'ai', 
    label: 'AI·포털', 
    count: 4, 
    colorClass: 'text-blue-700 bg-blue-50/80 border-blue-200 hover:bg-blue-100', 
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-xs' 
  },
  { 
    id: 'finance', 
    label: '회계·계약', 
    count: 4, 
    colorClass: 'text-emerald-700 bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100', 
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
  },
  { 
    id: 'admin', 
    label: '행정·서고', 
    count: 4, 
    colorClass: 'text-purple-700 bg-purple-50/80 border-purple-200 hover:bg-purple-100', 
    activeClass: 'bg-purple-600 text-white border-purple-600 shadow-xs' 
  },
  { 
    id: 'facility', 
    label: '시설·힐링', 
    count: 3, 
    colorClass: 'text-rose-700 bg-rose-50/80 border-rose-200 hover:bg-rose-100', 
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-xs' 
  },
];

interface ServiceCardItem {
  id: string;
  category: CategoryId;
  title: string;
  description: string;
  badge: string;
  actionText: string;
  href: string;
  isExternal: boolean;
  icon: React.ReactNode;
  theme: {
    stripe: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    actionColor: string;
    hoverBorder: string;
  };
  colSpan?: string;
}

const SERVICE_CARDS: ServiceCardItem[] = [
  // =========================================================================
  // ROW 1: AI & 스마트 포털 허브 (Royal Blue Top Accent 🔵 4칸)
  // =========================================================================
  {
    id: 'sen-chatbot',
    category: 'ai',
    title: 'AI-SEN 행정챗봇',
    description: '102권 서고 지침서 1:1 쪽수 뷰어 및 국가법령 연동',
    badge: '3-Tier',
    actionText: 'AI 질의하기',
    href: 'https://chatbot.aisen.store',
    isExternal: true,
    icon: <Bot size={18} />,
    theme: {
      stripe: 'bg-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-200',
      actionColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-400',
    }
  },
  {
    id: 'sen-travel',
    category: 'ai',
    title: 'AI-SEN 출장여비',
    description: '카카오 3개 경유지 및 오피넷 실시간 유가 연동 산출',
    badge: 'v4.9.2',
    actionText: '여비 산출',
    href: 'https://chatbot.aisen.store/travel',
    isExternal: true,
    icon: <Navigation size={18} />,
    theme: {
      stripe: 'bg-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-200',
      actionColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-400',
    }
  },
  {
    id: 'sen-board',
    category: 'ai',
    title: 'AI-SEN 소통게시판',
    description: '가입 없이 4자리 암호로 자유로운 실무 질의 및 공유',
    badge: '미가입',
    actionText: '게시판 가기',
    href: '/board',
    isExternal: false,
    icon: <MessageSquareShare size={18} />,
    theme: {
      stripe: 'bg-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-200',
      actionColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-400',
    }
  },
  {
    id: 'sen-forms',
    category: 'ai',
    title: 'AI-SEN 행정서식',
    description: '인사·복무·계약 등 71종 서식 실시간 미리보기 및 HWPX 다운',
    badge: '71종',
    actionText: '서식 서고',
    href: '/forms',
    isExternal: false,
    icon: <FileCheck size={18} />,
    theme: {
      stripe: 'bg-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-200',
      actionColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-400',
    }
  },

  // =========================================================================
  // ROW 2: 회계 & 계약 & 예산 (Emerald Green Top Accent 🟢 4칸 칼정렬)
  // =========================================================================
  {
    id: 'sen-contract',
    category: 'finance',
    title: 'AI-SEN 계약',
    description: '2026 계약방법 의사결정 & 맞춤 서류간소화 편철',
    badge: '2026 지침',
    actionText: '계약 검토',
    href: '/tools/contract',
    isExternal: false,
    icon: <Compass size={18} />,
    theme: {
      stripe: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      actionColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-400',
    }
  },
  {
    id: 'sen-cost-audit',
    category: 'finance',
    title: 'AI-SEN 공사원가',
    description: '조달청 법정 제비율 역산 대차대조 & AI 서류판단 기능',
    badge: '2026 고시',
    actionText: '원가 검증',
    href: '/tools/cost-audit',
    isExternal: false,
    icon: <Calculator size={18} />,
    theme: {
      stripe: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      actionColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-400',
    }
  },
  {
    id: 'sen-sfd',
    category: 'finance',
    title: 'AI-SEN 학교회계',
    description: '세부사업·추경·지출집행 실시간 모니터링 분석',
    badge: '2026 베타',
    actionText: '대시보드 열기',
    href: '/tools/sfd',
    isExternal: false,
    icon: <LayoutDashboard size={18} />,
    theme: {
      stripe: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      actionColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-400',
    }
  },
  {
    id: 'sen-budget-settle',
    category: 'finance',
    title: 'AI-SEN 예산정산',
    description: '수익자부담·목적사업비 세입세출 정산 및 잔액 분석',
    badge: '세입세출 정산',
    actionText: '정산 분석',
    href: '/tools/budget-settle',
    isExternal: false,
    icon: <ChartPie size={18} />,
    theme: {
      stripe: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      actionColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-400',
    }
  },

  // =========================================================================
  // ROW 3: 행정 실무 자료실 & 문서 툴킷 (Purple Top Accent 🟣 4칸 칼정렬)
  // =========================================================================
  {
    id: 'sen-archive',
    category: 'admin',
    title: 'AI-SEN 행정서고',
    description: '28개 분야 102권 공식 지침서 스트리밍 서고',
    badge: '102권',
    actionText: '서고 열람',
    href: '/archive',
    isExternal: false,
    icon: <FolderOpen size={18} />,
    theme: {
      stripe: 'bg-purple-600',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
      badgeBorder: 'border-purple-200',
      actionColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-400',
    }
  },
  {
    id: 'sen-sikdae',
    category: 'admin',
    title: 'AI-SEN 급여식대',
    description: '나이스 임금대장 (이름-식대) 공제내역 간편 추출',
    badge: '급식비 보안',
    actionText: '식대 분리',
    href: '/tools/sikdae',
    isExternal: false,
    icon: <UtensilsCrossed size={18} />,
    theme: {
      stripe: 'bg-purple-600',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
      badgeBorder: 'border-purple-200',
      actionColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-400',
    }
  },
  {
    id: 'sen-label-maker',
    category: 'admin',
    title: 'AI-SEN 지출바인더',
    description: '지출증빙서 측면 라벨 양식 자동 생성 및 규격 인쇄',
    badge: '라벨출력',
    actionText: '바인더 라벨',
    href: '/tools/label-maker',
    isExternal: false,
    icon: <Tag size={18} />,
    theme: {
      stripe: 'bg-purple-600',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
      badgeBorder: 'border-purple-200',
      actionColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-400',
    }
  },
  {
    id: 'sen-sheet-splitter',
    category: 'admin',
    title: 'AI-SEN 엑셀분리',
    description: '엑셀 파일 내 개별 시트를 단일 파일로 일괄 분리·저장',
    badge: '초고속 분리',
    actionText: '시트 분리',
    href: '/tools/sheet-splitter',
    isExternal: false,
    icon: <FileSpreadsheet size={18} />,
    theme: {
      stripe: 'bg-purple-600',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
      badgeBorder: 'border-purple-200',
      actionColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-400',
    }
  },

  // =========================================================================
  // ROW 4: 공간 & 시설 & 힐링 (Rose Top Accent 🔴 4칸 칼정렬: 1칸 + 1칸 + 2칸 와이드)
  // =========================================================================
  {
    id: 'sen-gym-calc',
    category: 'facility',
    title: 'AI-SEN 시설대관',
    description: '시설개방 조례 기준 체육관 대관료·냉난방비 자동 산출',
    badge: '조례 자동산출',
    actionText: '사용료 계산',
    href: '/tools/gym-calc',
    isExternal: false,
    icon: <Calculator size={18} />,
    theme: {
      stripe: 'bg-rose-500',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      actionColor: 'text-rose-600',
      hoverBorder: 'hover:border-rose-400',
    }
  },
  {
    id: 'sen-classmap',
    category: 'facility',
    title: 'AI-SEN 교실배치',
    description: '본관·신관 층별 평면도 시각화 및 학년도별 교실 도면 출력',
    badge: '도면제작',
    actionText: '도면 제작',
    href: '/tools/classmap',
    isExternal: false,
    icon: <LayoutGrid size={18} />,
    theme: {
      stripe: 'bg-rose-500',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      actionColor: 'text-rose-600',
      hoverBorder: 'hover:border-rose-400',
    }
  },
  {
    id: 'sen-watermelon',
    category: 'facility',
    title: 'AI-SEN 힐링게임',
    description: '3D 물리엔진 과일 합성 진화 게임 & 실시간 전국 랭킹 Top 10 (보스키 ` 탑재)',
    badge: '서울 교직원 랭킹',
    actionText: '게임 시작',
    href: '/tools/watermelon',
    isExternal: false,
    icon: <span className="text-lg">🍉</span>,
    theme: {
      stripe: 'bg-rose-500',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      actionColor: 'text-rose-600',
      hoverBorder: 'hover:border-rose-400',
    },
    colSpan: 'col-span-2 sm:col-span-1 lg:col-span-2'
  }
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.open(`https://chatbot.aisen.store?q=${encodeURIComponent(searchQuery.trim())}`, '_blank');
  };

  const filteredCards = activeCategory === 'all' 
    ? SERVICE_CARDS 
    : SERVICE_CARDS.filter(card => card.category === activeCategory);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 pt-2 sm:pt-3 pb-4 sm:pb-5 flex flex-col min-h-screen gap-2 sm:gap-2.5">
      
      {/* ========================================================
          1. TOP HERO: 대형 헤드라인 & 스마트 검색창 (모바일 컴팩트 뷰 최적화)
      ======================================================== */}
      <section className="flex flex-col items-center text-center pt-0 sm:pt-1">
        
        {/* [모바일 전용 컴팩트 상단바 (< sm)] */}
        <div className="w-full flex sm:hidden items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[14px] font-black tracking-tight text-slate-900">
              AI-SEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">포털</span>
            </span>
          </div>
          <button
            onClick={() => setManualOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold shadow-2xs active:scale-95 transition-transform"
          >
            <BookOpen size={11} className="text-blue-200" />
            <span>이용안내</span>
          </button>
        </div>

        {/* [데스크톱 전용 탑 배지 & 런처 (>= sm)] */}
        <div className="hidden sm:flex items-center justify-center gap-2 mb-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[12px] font-bold text-blue-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>서울특별시교육청 올인원 통합 포털</span>
          </div>

          <button
            onClick={() => setManualOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[12px] font-bold shadow-xs hover:shadow-md transition-all cursor-pointer group"
            title="AI-SEN 포털 및 15개 기능별 이용안내 열기"
          >
            <BookOpen size={13} className="text-blue-200 group-hover:scale-110 transition-transform" />
            <span>AI-SEN 이용안내</span>
          </button>
        </div>

        {/* Headline (데스크톱 대형 44px 폰트 & 모바일 1줄 요약) */}
        <h1 className="hidden sm:block text-3xl sm:text-4xl md:text-[44px] font-black text-slate-900 tracking-tight leading-tight">
          교육행정의 모든 기준과 계산, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">AI-SEN 포털</span>
        </h1>
        <p className="hidden sm:block text-[14.5px] sm:text-[15.5px] text-slate-500 mt-2 font-medium max-w-[720px]">
          102권 공식 지침서 1:1 쪽수 앵커링 RAG 챗봇과 카카오·오피넷 실시간 연동 스마트 여비정산기
        </p>

        {/* Unified Search Omnibar Box */}
        <div className="w-full max-w-[800px] mt-1 sm:mt-3">
          <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-2xl border border-slate-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100/80 transition-all shadow-2xs hover:shadow-md">
            <Search className="absolute left-3.5 sm:left-4 text-blue-500 pointer-events-none" size={17} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 지침(수의계약, 출장비, 강사료 등)이나 서식 검색..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 pl-10 sm:pl-11 pr-24 sm:pr-28 py-2 sm:py-2.5 text-xs sm:text-[14px] focus:outline-none font-medium"
            />
            <button 
              type="submit" 
              className="absolute right-1 sm:right-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-1 sm:py-1.5 px-3 sm:px-4 text-xs sm:text-[13px] font-bold shadow-xs hover:shadow-sm rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer"
            >
              <span>질의하기</span>
              <ArrowRight size={12} className="hidden sm:inline" />
            </button>
          </form>
        </div>

      </section>

      {/* ========================================================
          2. CATEGORY FILTER CHIPS (모바일 스크롤 피로도 70% 감소 칩 바)
      ======================================================== */}
      <section className="w-full max-w-[1400px] mx-auto pt-0.5 pb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs sm:text-[13px] font-bold border transition-all cursor-pointer select-none active:scale-95 ${
                  isActive ? cat.activeClass : cat.colorClass
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-white/90 text-slate-600 border border-slate-200/60'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          3. CORE SERVICES & MINI PROGRAMS GRID (4 x 4 완벽 칼정렬 & 모바일 반응형 뷰)
      ======================================================== */}
      <section className="w-full max-w-[1400px] mx-auto flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3" style={{gridAutoRows: '1fr'}}>
        {filteredCards.map((card) => {
          const cardContent = (
            <>
              {/* Top Accent Color Stripe */}
              <div className={`absolute top-0 left-0 right-0 h-[3.5px] ${card.theme.stripe} group-hover:h-[5px] transition-all`} />

              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${card.theme.iconBg} flex items-center justify-center border group-hover:scale-105 transition-transform`}>
                    {card.icon}
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <span className={`text-[10px] sm:text-[11.5px] font-bold ${card.theme.badgeText} ${card.theme.badgeBg} px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md border ${card.theme.badgeBorder} whitespace-nowrap`}>
                      {card.badge}
                    </span>
                    {card.isExternal ? (
                      <ArrowUpRight size={13} className="text-slate-400 group-hover:text-blue-600 transition-colors hidden sm:block" />
                    ) : (
                      <ArrowRight size={13} className="text-slate-400 group-hover:text-slate-700 transition-colors hidden sm:block" />
                    )}
                  </div>
                </div>

                <h2 className="text-[13.5px] sm:text-[15.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {card.title}
                </h2>
                <p className="text-[11px] sm:text-[12.5px] text-slate-500 mt-0.5 sm:mt-1 line-clamp-1 font-medium">
                  {card.description}
                </p>
              </div>

              <div className={`pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-[12px] ${card.theme.actionColor} font-bold`}>
                <span>{card.actionText}</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </>
          );

          const baseClassName = `relative overflow-hidden glass-card p-3 sm:p-3.5 pt-3.5 sm:pt-4 flex flex-col justify-between min-h-[135px] sm:h-[145px] group ${card.theme.hoverBorder} hover:shadow-md transition-all cursor-pointer bg-white ${card.colSpan || ''}`;

          if (card.isExternal) {
            return (
              <a
                key={card.id}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className={baseClassName}
              >
                {cardContent}
              </a>
            );
          }

          return (
            <Link
              key={card.id}
              href={card.href}
              className={baseClassName}
            >
              {cardContent}
            </Link>
          );
        })}
      </section>

      {/* ========================================================
          4. SLIM SECURITY & PRIVACY NOTICE BANNER (컴팩트 슬림 배너)
      ======================================================== */}
      <section className="w-full max-w-[1400px] mx-auto mt-0.5">
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl py-2 px-3 sm:px-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-center text-center gap-1 sm:gap-2.5 transition-all">
          
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

          {/* Title & Badge */}
          <div className="flex items-center justify-center gap-1.5 shrink-0">
            <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
            <span className="text-[12px] sm:text-[13px] font-bold text-slate-900 tracking-tight">
              100% 브라우저 로컬 처리 &amp; 개인정보 안심 보안
            </span>
            <span className="text-[10px] sm:text-[10.5px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.2 rounded-full border border-emerald-300">
              서버 유출 0%
            </span>
          </div>

          <span className="hidden sm:inline text-slate-300 text-xs">|</span>

          {/* Compact Description */}
          <p className="text-[11px] sm:text-[12px] text-slate-600 font-medium truncate sm:overflow-visible">
            임금대장·예산정산·엑셀분리 등 모든 실무 데이터는 외부 서버 전송 없이 <strong className="text-emerald-700 font-bold">내 PC 메모리에서 0초 즉시 처리</strong>됩니다.
          </p>

        </div>
      </section>

      {/* ========================================================
          5. COMPACT FOOTER
      ======================================================== */}
      <footer className="w-full pt-1.5 pb-1 border-t border-slate-200 flex items-center justify-center text-[10px] sm:text-xs text-slate-400 font-medium">
        <span>&copy; 2026 AI-SEN STORE. All rights reserved.</span>
      </footer>

      {/* 6. 통합 이용안내 모달 */}
      <IntegratedManualModal isOpen={manualOpen} onClose={() => setManualOpen(false)} />

    </div>
  );
}
