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
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSidebar } from './SidebarContext';

const AI_NAV_ITEMS = [
  { name: 'AI 행정 챗봇', href: 'https://chatbot.aisen.store', icon: <Bot size={20} />, isExternal: true, badge: '3-Tier' },
  { name: '구글 챗봇 모음', href: '/chatbot', icon: <MessageSquare size={20} />, isExternal: false },
  { name: '스마트 여비정산기', href: 'https://chatbot.aisen.store/travel', icon: <Navigation size={20} />, isExternal: true, badge: 'v4.9.2' },
];

const WORK_NAV_ITEMS = [
  { name: '행정 자료실', href: '/archive', icon: <FileText size={20} />, isExternal: false },
  { name: '미니 프로그램', href: '/tools', icon: <Zap size={20} />, isExternal: false },
  { name: '업무 소통 게시판', href: '/board', icon: <LayoutDashboard size={20} />, isExternal: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isCollapsed, setIsCollapsed, toggleSidebar } = useSidebar();

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
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                  AI 핵심 솔루션
                </p>
                {AI_NAV_ITEMS.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-500">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                  행정 지원 &amp; 아카이브
                </p>
                {WORK_NAV_ITEMS.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-500">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              {user ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
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
          3. DESKTOP FLOATING OPEN BUTTON (접혔을 때 열기 버튼 >>)
      ────────────────────────────────────────────────────────── */}
      {isCollapsed && (
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
          4. DESKTOP FOLDABLE SIDEBAR (접었다 폈다 가능한 사이드바)
      ────────────────────────────────────────────────────────── */}
      <aside 
        className={`hidden md:flex fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 flex-col justify-between p-4 shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? '-translate-x-full w-0 opacity-0 pointer-events-none' : 'translate-x-0 w-64 opacity-100'
        }`}
      >
        {/* Top: Header with Fold Button & Navigation */}
        <div className="flex flex-col gap-5">
          
          {/* Brand Logo & 접기(<<) 토글 버튼 */}
          <div className="flex items-center justify-between px-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                i
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                    아이센스토어
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    Live
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">AI-SEN HUB v4.9.2</span>
              </div>
            </Link>

            {/* << 접기 버튼 */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="사이드바 접기 (<<)"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Group 1: AI 핵심 솔루션 */}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-0.5">
              AI 핵심 솔루션
            </p>

            {AI_NAV_ITEMS.map((item) => {
              const isActive = !item.isExternal && pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13.5px] font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>

                  {item.badge ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {item.badge}
                    </span>
                  ) : item.isExternal && (
                    <ExternalLink size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Group 2: 행정 업무 지원 */}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-0.5">
              행정 지원 &amp; 아카이브
            </p>

            {WORK_NAV_ITEMS.map((item) => {
              const isActive = !item.isExternal && pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13.5px] font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>

        {/* Bottom Area */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
          {user ? (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{user.email}</span>
              <button onClick={handleLogout} className="text-xs font-bold text-red-600 hover:underline">
                로그아웃
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <LogIn size={14} />
              <span>로그인</span>
            </Link>
          )}

          <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            아이센스토어 © 2026
          </div>
        </div>

      </aside>
    </>
  );
}
