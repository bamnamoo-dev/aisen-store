'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  MessageSquare, 
  Navigation, 
  MessageSquareShare,
  FileCheck,
  Compass,
  Calculator,
  ChartPie,
  LayoutDashboard,
  FolderOpen,
  UtensilsCrossed,
  Tag,
  FileSpreadsheet,
  LayoutGrid,
  LogIn, 
  Menu, 
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  House
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSidebar } from './SidebarContext';

// 1. AI & 포털 허브 (🔵)
const AI_HUB_ITEMS = [
  { name: 'AI-SEN 행정챗봇', href: 'https://chatbot.aisen.store', icon: <Bot size={20} className="text-blue-600" />, isExternal: true, badge: '3-Tier' },
  { name: 'AI-SEN 출장여비', href: 'https://chatbot.aisen.store/travel', icon: <Navigation size={20} className="text-blue-600" />, isExternal: true, badge: 'v4.9.2' },
  { name: 'AI-SEN 소통게시판', href: '/board', icon: <MessageSquareShare size={20} className="text-blue-600" />, isExternal: false, badge: '소통' },
  { name: 'AI-SEN 행정서식', href: 'https://chatbot.aisen.store?forms=1', icon: <FileCheck size={20} className="text-blue-600" />, isExternal: true, badge: '68종' },
  { name: '구글 맞춤챗봇', href: '/chatbot', icon: <MessageSquare size={20} className="text-indigo-600" />, isExternal: false, badge: 'Gemini' },
];

// 2. 회계 & 계약 & 예산 (🟢)
const FINANCE_CONTRACT_ITEMS = [
  { name: 'AI-SEN 계약', href: '/tools/contract', icon: <Compass size={20} className="text-emerald-600" />, isExternal: false, badge: '2026' },
  { name: 'AI-SEN 공사원가', href: '/tools/cost-audit', icon: <Calculator size={20} className="text-emerald-600" />, isExternal: false, badge: '원가' },
  { name: 'AI-SEN 학교회계', href: '/tools/sfd', icon: <ChartPie size={20} className="text-emerald-600" />, isExternal: false, badge: 'SFD' },
  { name: 'AI-SEN 예산정산', href: '/tools/budget-settle', icon: <LayoutDashboard size={20} className="text-emerald-600" />, isExternal: false, badge: '정산' },
];

// 3. 행정 실무 & 서고 (🟣)
const ADMIN_DOC_ITEMS = [
  { name: 'AI-SEN 행정서고', href: '/archive', icon: <FolderOpen size={20} className="text-purple-600" />, isExternal: false, badge: '102권' },
  { name: 'AI-SEN 급여식대', href: '/tools/sikdae', icon: <UtensilsCrossed size={20} className="text-purple-600" />, isExternal: false, badge: '식대' },
  { name: 'AI-SEN 지출바인더', href: '/tools/label-maker', icon: <Tag size={20} className="text-purple-600" />, isExternal: false, badge: '라벨' },
  { name: 'AI-SEN 엑셀분리', href: '/tools/sheet-splitter', icon: <FileSpreadsheet size={20} className="text-purple-600" />, isExternal: false, badge: '분리' },
];

// 4. 공간 & 시설 & 힐링 (🔴)
const SPACE_HEALING_ITEMS = [
  { name: 'AI-SEN 시설대관', href: '/tools/gym-calc', icon: <Calculator size={20} className="text-rose-600" />, isExternal: false, badge: '조례' },
  { name: 'AI-SEN 교실배치', href: '/tools/classmap', icon: <LayoutGrid size={20} className="text-rose-600" />, isExternal: false, badge: '도면' },
  { name: 'AI-SEN 힐링게임', href: '/tools/watermelon', icon: <span className="text-base">🍉</span>, isExternal: false, badge: '게임' },
];

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  isExternal: boolean;
  badge?: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const renderNavList = (items: NavItem[], isMobile = false) => (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = !item.isExternal && pathname === item.href;
        return (
          <Link
            key={item.name + item.href}
            href={item.href}
            target={item.isExternal ? '_blank' : undefined}
            rel={item.isExternal ? 'noopener noreferrer' : undefined}
            onClick={() => { 
              if (isMobile) setMobileMenuOpen(false); 
              if (!item.isExternal) setIsCollapsed(true);
            }}
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs sm:text-[13.5px] font-bold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/80'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`shrink-0 flex items-center justify-center ${isActive ? 'text-white' : ''}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.name}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                  isActive
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.isExternal && (
                <ExternalLink size={12} className={isActive ? 'text-white' : 'text-slate-400'} />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          1. MOBILE TOP BAR (모바일 상단 헤더)
      ────────────────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-15 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
            i
          </div>
          <span className="text-lg font-black text-slate-900">AI-SEN 포털</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* ──────────────────────────────────────────────────────────
          2. MOBILE DRAWER (모바일 사이드 드로어)
      ────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs pt-15">
          <div className="bg-white h-full w-4/5 max-w-[320px] p-4.5 flex flex-col justify-between overflow-y-auto shadow-2xl border-r border-slate-200">
            <div className="flex flex-col gap-4">
              
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-black text-sm border border-blue-100"
              >
                <House size={17} />
                <span>메인 포털 홈으로</span>
              </Link>

              {/* Group 1: 🔵 AI & 포털 허브 */}
              <div>
                <p className="text-xs font-bold text-blue-600 px-3 uppercase tracking-wider mb-1">
                  🔵 AI &amp; 포털 허브
                </p>
                {renderNavList(AI_HUB_ITEMS, true)}
              </div>

              {/* Group 2: 🟢 회계 & 계약 & 예산 */}
              <div>
                <p className="text-xs font-bold text-emerald-600 px-3 uppercase tracking-wider mb-1">
                  🟢 회계 &amp; 계약 &amp; 예산
                </p>
                {renderNavList(FINANCE_CONTRACT_ITEMS, true)}
              </div>

              {/* Group 3: 🟣 행정 실무 & 서고 */}
              <div>
                <p className="text-xs font-bold text-purple-600 px-3 uppercase tracking-wider mb-1">
                  🟣 행정 실무 &amp; 서고
                </p>
                {renderNavList(ADMIN_DOC_ITEMS, true)}
              </div>

              {/* Group 4: 🔴 공간 & 시설 & 힐링 */}
              <div>
                <p className="text-xs font-bold text-rose-600 px-3 uppercase tracking-wider mb-1">
                  🔴 공간 &amp; 시설 &amp; 힐링
                </p>
                {renderNavList(SPACE_HEALING_ITEMS, true)}
              </div>

            </div>

            <div className="pt-3.5 border-t border-slate-200 flex flex-col gap-2 mt-4">
              {user ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-bold text-slate-800">관리자</span>
                  </div>
                  <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-600">
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold shadow-2xs"
                >
                  <LogIn size={16} />
                  <span>관리자 로그인</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          3. DESKTOP FLOATING OPEN BUTTON (홈 화면에서 접혔을 때만 표시)
      ────────────────────────────────────────────────────────── */}
      {isCollapsed && pathname === '/' && (
        <button
          onClick={toggleSidebar}
          className="hidden md:flex fixed top-4 left-4 z-40 items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl shadow-md text-sm font-bold text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:shadow-lg transition-all animate-in fade-in zoom-in-95 group"
          title="사이드 메뉴 펼치기 (>>)"
        >
          <Menu size={17} className="text-slate-500 group-hover:text-blue-600" />
          <span>메뉴 펼치기</span>
          <ChevronRight size={16} className="text-blue-600 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* ──────────────────────────────────────────────────────────
          4. DESKTOP FOLDABLE SIDEBAR (메인 4대 행 1:1 완벽 동기화)
      ────────────────────────────────────────────────────────── */}
      <aside 
        className={`hidden md:flex fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 flex-col justify-between shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? '-translate-x-full w-0 opacity-0 pointer-events-none' : 'translate-x-0 w-72 opacity-100'
        }`}
      >
        {/* Top Header & Scrollable Nav Area */}
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9.5 h-9.5 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                i
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                    AI-SEN 포털
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Live
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-400">교육행정 올인원 포털</span>
              </div>
            </Link>

            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="사이드바 접기 (<<)"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Scrollable Navigation List (4대 영역 칼정렬) */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5">
            
            {/* 홈 바로가기 */}
            <Link 
              href="/" 
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-[13.5px] transition-all ${
                pathname === '/' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs' 
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <House size={16} className={pathname === '/' ? 'text-blue-600' : 'text-slate-500'} />
              <span>포털 메인 홈</span>
            </Link>

            {/* 1. 🔵 AI & 포털 허브 */}
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold text-blue-600 px-2.5 uppercase tracking-wider">
                🔵 AI &amp; 포털 허브
              </p>
              {renderNavList(AI_HUB_ITEMS)}
            </div>

            {/* 2. 🟢 회계 & 계약 & 예산 */}
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold text-emerald-600 px-2.5 uppercase tracking-wider">
                🟢 회계 &amp; 계약 &amp; 예산
              </p>
              {renderNavList(FINANCE_CONTRACT_ITEMS)}
            </div>

            {/* 3. 🟣 행정 실무 & 서고 */}
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold text-purple-600 px-2.5 uppercase tracking-wider">
                🟣 행정 실무 &amp; 서고
              </p>
              {renderNavList(ADMIN_DOC_ITEMS)}
            </div>

            {/* 4. 🔴 공간 & 시설 & 힐링 */}
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold text-rose-600 px-2.5 uppercase tracking-wider">
                🔴 공간 &amp; 시설 &amp; 힐링
              </p>
              {renderNavList(SPACE_HEALING_ITEMS)}
            </div>

          </div>

          {/* Bottom Area */}
          <div className="p-3 border-t border-slate-100 flex flex-col gap-2 shrink-0 bg-slate-50/50">
            {user ? (
              <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">관리자</span>
                </div>
                <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer">
                  로그아웃
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-colors"
              >
                <LogIn size={15} className="text-slate-500" />
                <span>관리자 로그인</span>
              </Link>
            )}

            <div className="text-[10.5px] text-slate-400 text-center font-medium">
              AI-SEN 포털 &copy; 2026
            </div>
          </div>

        </div>

      </aside>
    </>
  );
}
