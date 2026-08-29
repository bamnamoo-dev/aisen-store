'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  MessageSquare, 
  Navigation, 
  FileText, 
  Zap, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PieChart,
  Tag,
  Grid,
  FileSpreadsheet,
  UtensilsCrossed,
  Calculator,
  Flame,
  Home
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSidebar } from './SidebarContext';

// 1. AI & 특화 솔루션 그룹
const AI_NAV_ITEMS = [
  { name: 'AI 행정 챗봇', href: 'https://chatbot.aisen.store', icon: <Bot size={18} className="text-blue-600" />, isExternal: true, badge: '3-Tier' },
  { name: '구글 챗봇 모음', href: '/chatbot', icon: <MessageSquare size={18} className="text-indigo-600" />, isExternal: false, badge: 'Gemini' },
  { name: '스마트 여비정산기', href: 'https://chatbot.aisen.store/travel', icon: <Navigation size={18} className="text-sky-600" />, isExternal: true, badge: 'v4.9.2' },
  { name: '행정·민원 서식 68종', href: 'https://chatbot.aisen.store?forms=1', icon: <FileText size={18} className="text-amber-600" />, isExternal: true, badge: '68종' },
  { name: '학교회계 대시보드', href: 'https://bamnamoo-dev.github.io/SFD/', icon: <PieChart size={18} className="text-teal-600" />, isExternal: true, badge: 'SFD' },
];

// 2. 공식 지침서 & 소통 공간 그룹
const ARCHIVE_NAV_ITEMS = [
  { name: '행정 자료실', href: '/archive', icon: <FileText size={18} className="text-emerald-600" />, isExternal: false, badge: '102권' },
  { name: '업무 소통 게시판', href: '/board', icon: <LayoutDashboard size={18} className="text-sky-600" />, isExternal: false, badge: '소통' },
];

// 3. 6대 초고속 행정 실무 툴킷 그룹
const TOOLKIT_NAV_ITEMS = [
  { name: '증빙서 측면표지', href: '/tools/label-maker', icon: <Tag size={18} className="text-violet-600" />, isExternal: false, badge: '라벨' },
  { name: '스마트 교실배치도', href: '/tools/classmap', icon: <Grid size={18} className="text-cyan-600" />, isExternal: false, badge: '도면' },
  { name: '엑셀시트 분리기', href: '/tools/sheet-splitter', icon: <FileSpreadsheet size={18} className="text-emerald-700" />, isExternal: false, badge: '분리' },
  { name: '임금대장 식대분리', href: '/tools/sikdae', icon: <UtensilsCrossed size={18} className="text-orange-600" />, isExternal: false, badge: '식대' },
  { name: '체육관 사용료', href: '/tools/gym-calc', icon: <Calculator size={18} className="text-pink-600" />, isExternal: false, badge: '조례' },
  { name: '행정 힐링 수박게임', href: '/tools/watermelon', icon: <span className="text-sm">🍉</span>, isExternal: false, badge: '게임' },
];

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

  const renderNavList = (items: typeof AI_NAV_ITEMS, isMobile = false) => (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive = !item.isExternal && pathname === item.href;
        return (
          <Link
            key={item.name + item.href}
            href={item.href}
            target={item.isExternal ? '_blank' : undefined}
            rel={item.isExternal ? 'noopener noreferrer' : undefined}
            onClick={() => { if (isMobile) setMobileMenuOpen(false); }}
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all ${
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

            <div className="flex items-center gap-1 shrink-0">
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
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm">
            i
          </div>
          <span className="text-base font-black text-slate-900">아이센스토어</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ──────────────────────────────────────────────────────────
          2. MOBILE DRAWER (모바일 사이드 드로어)
      ────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs pt-14">
          <div className="bg-white h-full w-4/5 max-w-[300px] p-4 flex flex-col justify-between overflow-y-auto shadow-2xl border-r border-slate-200">
            <div className="flex flex-col gap-4">
              
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-black text-xs border border-blue-100"
              >
                <Home size={15} />
                <span>메인 포털 홈으로</span>
              </Link>

              {/* Group 1 */}
              <div>
                <p className="text-[10.5px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-1">
                  🤖 AI &amp; 특화 솔루션
                </p>
                {renderNavList(AI_NAV_ITEMS, true)}
              </div>

              {/* Group 2 */}
              <div>
                <p className="text-[10.5px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-1">
                  🏛️ 지침서 &amp; 소통 서고
                </p>
                {renderNavList(ARCHIVE_NAV_ITEMS, true)}
              </div>

              {/* Group 3 */}
              <div>
                <p className="text-[10.5px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-1">
                  ⚡ 6대 행정 실무 툴킷
                </p>
                {renderNavList(TOOLKIT_NAV_ITEMS, true)}
              </div>

            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2 mt-4">
              {user ? (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 truncate">{user.email}</span>
                  <button onClick={handleLogout} className="text-xs font-bold text-red-600">
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs"
                >
                  <LogIn size={15} />
                  <span>로그인</span>
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
          className="hidden md:flex fixed top-3.5 left-3.5 z-40 items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl shadow-md text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:shadow-lg transition-all animate-in fade-in zoom-in-95 group"
          title="사이드 메뉴 펼치기 (>>)"
        >
          <Menu size={15} className="text-slate-500 group-hover:text-blue-600" />
          <span>메뉴 펼치기</span>
          <ChevronRight size={14} className="text-blue-600 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* ──────────────────────────────────────────────────────────
          4. DESKTOP FOLDABLE SIDEBAR (12개 카드 동기화 + 구글챗봇)
      ────────────────────────────────────────────────────────── */}
      <aside 
        className={`hidden md:flex fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 flex-col justify-between shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? '-translate-x-full w-0 opacity-0 pointer-events-none' : 'translate-x-0 w-64 opacity-100'
        }`}
      >
        {/* Top Header & Scrollable Nav Area */}
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                i
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                    아이센스토어
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    Live
                  </span>
                </div>
                <span className="text-[10.5px] font-medium text-slate-400">AI-SEN HUB v4.9.2</span>
              </div>
            </Link>

            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="사이드바 접기 (<<)"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Scrollable Navigation List */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
            
            {/* 홈 바로가기 */}
            <Link 
              href="/" 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                pathname === '/' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs' 
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <Home size={15} className={pathname === '/' ? 'text-blue-600' : 'text-slate-500'} />
              <span>포털 메인 홈</span>
            </Link>

            {/* 1. AI & 특화 솔루션 */}
            <div className="flex flex-col gap-1">
              <p className="text-[10.5px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                🤖 AI &amp; 특화 솔루션
              </p>
              {renderNavList(AI_NAV_ITEMS)}
            </div>

            {/* 2. 공식 지침서 & 소통 공간 */}
            <div className="flex flex-col gap-1">
              <p className="text-[10.5px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                🏛️ 지침서 &amp; 소통 서고
              </p>
              {renderNavList(ARCHIVE_NAV_ITEMS)}
            </div>

            {/* 3. 6대 행정 실무 툴킷 */}
            <div className="flex flex-col gap-1">
              <p className="text-[10.5px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                ⚡ 6대 행정 실무 툴킷
              </p>
              {renderNavList(TOOLKIT_NAV_ITEMS)}
            </div>

          </div>

          {/* Bottom Area */}
          <div className="p-3 border-t border-slate-100 flex flex-col gap-2 shrink-0 bg-slate-50/50">
            {user ? (
              <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user.email}</span>
                <button onClick={handleLogout} className="text-xs font-bold text-red-600 hover:underline">
                  로그아웃
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <LogIn size={13} />
                <span>교직원 로그인</span>
              </Link>
            )}

            <div className="text-[10px] text-slate-400 text-center font-medium">
              아이센스토어 &copy; 2026
            </div>
          </div>

        </div>

      </aside>
    </>
  );
}
