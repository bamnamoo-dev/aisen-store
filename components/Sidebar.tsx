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
  House,
  BookOpen,
  FileText,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSidebar } from './SidebarContext';

// =============================================================================
// 네비게이션 아이템 정의 (메인 4대 행과 1:1 완벽 일치)
// =============================================================================

// 1. 🔵 AI & 지침 허브
const AI_HUB_ITEMS = [
  { name: '행정챗봇', href: 'https://chatbot.aisen.store', icon: <Bot size={18} className="text-blue-600" />, isExternal: true, badge: '3-Tier' },
  { name: '행정서고', href: '/archive', icon: <FolderOpen size={18} className="text-blue-600" />, isExternal: false, badge: '102권' },
  { name: '출장여비', href: 'https://chatbot.aisen.store/travel', icon: <Navigation size={18} className="text-blue-600" />, isExternal: true, badge: 'v5.0.0' },
  { name: '소통게시판', href: '/board', icon: <MessageSquareShare size={18} className="text-blue-600" />, isExternal: false, badge: '소통' },
  { name: '구글 맞춤챗봇', href: '/chatbot', icon: <MessageSquare size={18} className="text-blue-600" />, isExternal: false, badge: 'Gemini' },
];

// 2. 🟢 회계 & 계약 & 예산
const FINANCE_CONTRACT_ITEMS = [
  { name: '계약', href: '/tools/contract', icon: <Compass size={18} className="text-emerald-600" />, isExternal: false, badge: '2026' },
  { name: '공사원가', href: '/tools/cost-audit', icon: <Calculator size={18} className="text-emerald-600" />, isExternal: false, badge: '원가' },
  { name: '학교회계', href: '/tools/sfd', icon: <ChartPie size={18} className="text-emerald-600" />, isExternal: false, badge: 'SFD' },
  { name: '예산정산', href: '/tools/budget-settle', icon: <LayoutDashboard size={18} className="text-emerald-600" />, isExternal: false, badge: '정산' },
];

// 3. 🟣 행정 실무 & 엑셀
const ADMIN_DOC_ITEMS = [
  { name: '엑셀수합', href: '/tools/excel-merge', icon: <Layers size={18} className="text-purple-600" />, isExternal: false, badge: '수합' },
  { name: '엑셀분리', href: '/tools/sheet-splitter', icon: <FileSpreadsheet size={18} className="text-purple-600" />, isExternal: false, badge: '분리' },
  { name: '급여식대', href: '/tools/sikdae', icon: <UtensilsCrossed size={18} className="text-purple-600" />, isExternal: false, badge: '식대' },
  { name: '지출바인더', href: '/tools/label-maker', icon: <Tag size={18} className="text-purple-600" />, isExternal: false, badge: '라벨' },
];

// 4. 🔴 서식 & 시설 & 힐링
const SPACE_HEALING_ITEMS = [
  { name: '기안문', href: '/tools/draft-helper', icon: <FileText size={18} className="text-rose-600" />, isExternal: false, badge: '237종' },
  { name: '행정서식', href: '/forms', icon: <FileCheck size={18} className="text-rose-600" />, isExternal: false, badge: '71종' },
  { name: '시설대관', href: '/tools/gym-calc', icon: <Calculator size={18} className="text-rose-600" />, isExternal: false, badge: '조례' },
  { name: '교실배치', href: '/tools/classmap', icon: <LayoutGrid size={18} className="text-rose-600" />, isExternal: false, badge: '도면' },
  { name: '힐링게임', href: '/tools/watermelon', icon: <span className="text-base leading-none">🍉</span>, isExternal: false, badge: '게임' },
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
  const { isCollapsed, toggleSidebar, setIsCollapsed } = useSidebar();

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
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/90 active:bg-slate-200/70'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`shrink-0 flex items-center justify-center transition-transform ${isActive ? 'text-white scale-105' : ''}`}>
                {item.icon}
              </span>
              <span className="truncate tracking-tight">{item.name}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {item.badge && (
                <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border ${
                  isActive
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-white text-slate-500 border-slate-200/90 shadow-2xs'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.isExternal && (
                <ExternalLink size={12.5} className={isActive ? 'text-white' : 'text-slate-400'} />
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
          <div className="bg-white h-full w-4/5 max-w-[320px] p-4 flex flex-col justify-between overflow-y-auto shadow-2xl border-r border-slate-200">
            <div className="flex flex-col gap-3.5">
              {/* 모바일 상단 퀵 헤더 */}
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100"
                >
                  <House size={14} />
                  <span>포털 홈</span>
                </Link>

                <Link 
                  href="/guide" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                    pathname === '/guide'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>이용안내</span>
                </Link>
              </div>

              {/* Group 1: 🔵 AI & 지침 허브 */}
              <div>
                <p className="text-[12.5px] font-extrabold text-blue-600 px-3 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🔵</span>
                  <span>AI &amp; 지침 허브</span>
                </p>
                {renderNavList(AI_HUB_ITEMS, true)}
              </div>

              {/* Group 2: 🟢 회계 & 계약 & 예산 */}
              <div className="pt-2.5 border-t border-slate-100">
                <p className="text-[12.5px] font-extrabold text-emerald-600 px-3 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🟢</span>
                  <span>회계 &amp; 계약 &amp; 예산</span>
                </p>
                {renderNavList(FINANCE_CONTRACT_ITEMS, true)}
              </div>

              {/* Group 3: 🟣 행정 실무 & 엑셀 */}
              <div className="pt-2.5 border-t border-slate-100">
                <p className="text-[12.5px] font-extrabold text-purple-600 px-3 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🟣</span>
                  <span>행정 실무 &amp; 엑셀</span>
                </p>
                {renderNavList(ADMIN_DOC_ITEMS, true)}
              </div>

              {/* Group 4: 🔴 서식 & 시설 & 힐링 */}
              <div className="pt-2.5 border-t border-slate-100">
                <p className="text-[12.5px] font-extrabold text-rose-600 px-3 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🔴</span>
                  <span>서식 &amp; 시설 &amp; 힐링</span>
                </p>
                {renderNavList(SPACE_HEALING_ITEMS, true)}
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-200 flex flex-col gap-2 mt-4 shrink-0">
              {user ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-bold text-slate-800">관리자 모드</span>
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
          4. DESKTOP FOLDABLE SIDEBAR (메인 4대 행 1:1 완벽 동기화 & 여백 균형 리디자인)
      ────────────────────────────────────────────────────────── */}
      <aside 
        className={`hidden md:flex fixed inset-y-0 left-0 bg-white border-r border-slate-200/90 z-40 flex-col justify-between shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? '-translate-x-full w-0 opacity-0 pointer-events-none' : 'translate-x-0 w-72 opacity-100'
        }`}
      >
        {/* Top Header & Scrollable Nav Area */}
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="py-3 px-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60 gap-2">
            <Link href="/" className="flex items-center gap-2.5 group min-w-0 shrink" title="메인 포털 홈으로 이동">
              <div className="w-8.5 h-8.5 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                i
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-[13.5px] font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight whitespace-nowrap">
                    AI-SEN 포털
                  </span>
                  <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0 whitespace-nowrap">
                    Live
                  </span>
                </div>
                <span className="text-[10.5px] font-semibold text-slate-400 whitespace-nowrap tracking-tight">
                  교육행정 올인원 허브
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/guide"
                className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                  pathname === '/guide'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70'
                }`}
                title="AI-SEN 종합 이용안내서 열기"
              >
                <BookOpen size={11} className="shrink-0" />
                <span className="whitespace-nowrap">가이드</span>
              </Link>

              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
                title="사이드바 접기 (<<)"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          {/* Navigation List (시원한 14px 폰트, 여유로운 여백, 자연스러운 슬림 스크롤) */}
          <div className="flex-1 overflow-y-auto p-3 px-3.5 flex flex-col gap-3">
            {/* 1. 🔵 AI & 지침 허브 */}
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] font-extrabold text-blue-600 px-2.5 py-0.5 uppercase tracking-tight flex items-center gap-1.5">
                <span className="text-[13px]">🔵</span>
                <span>AI &amp; 지침 허브</span>
              </p>
              {renderNavList(AI_HUB_ITEMS)}
            </div>

            {/* 2. 🟢 회계 & 계약 & 예산 */}
            <div className="flex flex-col gap-1 pt-2.5 border-t border-slate-100">
              <p className="text-[12.5px] font-extrabold text-emerald-600 px-2.5 py-0.5 uppercase tracking-tight flex items-center gap-1.5">
                <span className="text-[13px]">🟢</span>
                <span>회계 &amp; 계약 &amp; 예산</span>
              </p>
              {renderNavList(FINANCE_CONTRACT_ITEMS)}
            </div>

            {/* 3. 🟣 행정 실무 & 엑셀 */}
            <div className="flex flex-col gap-1 pt-2.5 border-t border-slate-100">
              <p className="text-[12.5px] font-extrabold text-purple-600 px-2.5 py-0.5 uppercase tracking-tight flex items-center gap-1.5">
                <span className="text-[13px]">🟣</span>
                <span>행정 실무 &amp; 엑셀</span>
              </p>
              {renderNavList(ADMIN_DOC_ITEMS)}
            </div>

            {/* 4. 🔴 서식 & 시설 & 힐링 */}
            <div className="flex flex-col gap-1 pt-2.5 border-t border-slate-100">
              <p className="text-[12.5px] font-extrabold text-rose-600 px-2.5 py-0.5 uppercase tracking-tight flex items-center gap-1.5">
                <span className="text-[13px]">🔴</span>
                <span>서식 &amp; 시설 &amp; 힐링</span>
              </p>
              {renderNavList(SPACE_HEALING_ITEMS)}
            </div>
          </div>

          {/* Bottom Area (공백 해소: 100% 로컬 보안 안내 + 관리자 계정 바) */}
          <div className="p-3 border-t border-slate-100 flex flex-col gap-2 shrink-0 bg-slate-50/70">
            {/* 보안 안심 슬림 카드 */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-500 leading-snug shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-0.5">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>100% 로컬 보안 안심 처리</span>
              </div>
              <p className="text-[10.5px] text-slate-500 pl-4.5">
                개인정보·급여 데이터 서버 유출 0%
              </p>
            </div>

            {/* 관리자 계정 상태 */}
            {user ? (
              <div className="p-2 px-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-800">관리자 모드</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-100/90 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-colors"
              >
                <LogIn size={13} className="text-slate-500" />
                <span>관리자 로그인</span>
              </Link>
            )}

            <div className="flex items-center justify-between text-[10.5px] text-slate-400 px-1 font-medium pt-0.5">
              <span>AI-SEN 포털 v5.2</span>
              <span>서울특별시교육청</span>
            </div>
          </div>

        </div>

      </aside>
    </>
  );
}
