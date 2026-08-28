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
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AI_NAV_ITEMS = [
  { name: 'AI 행정 챗봇', href: 'https://chatbot.aisen.store', icon: <Bot size={19} />, isExternal: true, badge: '3-Tier' },
  { name: '구글 챗봇 모음', href: '/chatbot', icon: <MessageSquare size={19} />, isExternal: false },
  { name: '스마트 여비정산기', href: 'https://chatbot.aisen.store/travel', icon: <Navigation size={19} />, isExternal: true, badge: 'v4.9.2' },
];

const WORK_NAV_ITEMS = [
  { name: '행정 자료실', href: '/archive', icon: <FileText size={19} />, isExternal: false },
  { name: '미니 프로그램', href: '/tools', icon: <Zap size={19} />, isExternal: false },
  { name: '업무 소통 게시판', href: '/board', icon: <LayoutDashboard size={19} />, isExternal: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const allNavItems = [...AI_NAV_ITEMS, ...WORK_NAV_ITEMS];

  return (
    <>
      {/* ========================================================
          MOBILE TOP BAR (md:hidden)
      ======================================================== */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-base shadow-xs">
            i
          </div>
          <span className="text-lg font-black text-slate-900">아이센스토어</span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Live
          </span>
        </Link>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-50 p-6 flex flex-col justify-between overflow-y-auto border-t border-slate-200">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-slate-400 px-3 mb-1 uppercase tracking-wider">전체 메뉴</p>
            {allNavItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-xl text-slate-800 text-base font-bold hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-blue-600">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-5 border-t border-slate-200 flex justify-between items-center text-sm">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-slate-700 font-bold">{user.email}</span>
                <button onClick={handleLogout} className="text-red-600 font-bold">로그아웃</button>
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          DESKTOP LEFT SIDEBAR (Fixed Left w-64)
      ======================================================== */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-40 flex-col justify-between p-5 shadow-xs">
        
        {/* Top: Logo & Grouped Navigation */}
        <div className="flex flex-col gap-6">
          
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-3 px-1 py-1 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20">
              i
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                  아이센스토어
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Live
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400">AI-SEN HUB v4.9.2</span>
            </div>
          </Link>

          {/* Group 1: AI 솔루션 */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider mb-1">
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {item.badge}
                    </span>
                  ) : (
                    <ExternalLink size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Group 2: 행정 업무 지원 */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider mb-1">
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>

        {/* Bottom: Info Card & User Profile */}
        <div className="flex flex-col gap-3 pt-3 border-t border-slate-200">
          
          {/* Quick Info Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
              <BookOpen size={14} className="text-blue-600" />
              <span>지침서 102권 스트리밍</span>
            </div>
            <span>오피넷 실시간 유가 1일 6회 자동 고시 및 출장비 산출</span>
          </div>

          {/* User Profile */}
          {user ? (
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-slate-800 truncate">{user.email.split('@')[0]}님</span>
                <span className="text-xs text-slate-400">교직원 인증 계정</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:bg-red-50 p-2 rounded-lg"
                title="로그아웃"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-xs"
            >
              <LogIn size={15} />
              <span>관리자 / 회원 로그인</span>
            </Link>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>교육행정 AI 통합 포털</span>
          </div>
        </div>

      </aside>
    </>
  );
}
