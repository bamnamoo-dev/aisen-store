'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, MessageSquare, Navigation, FileText, Zap, LayoutDashboard, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const NAV_ITEMS = [
  { name: 'AI 챗봇', href: 'https://chatbot.aisen.store', icon: <Bot size={17} />, isExternal: true },
  { name: '구글 챗봇', href: '/chatbot', icon: <MessageSquare size={17} />, isExternal: false },
  { name: '출장비 계산기', href: 'https://chatbot.aisen.store/travel', icon: <Navigation size={17} />, isExternal: true },
  { name: '행정 자료실', href: '/archive', icon: <FileText size={17} />, isExternal: false },
  { name: '미니 프로그램', href: '/tools', icon: <Zap size={17} />, isExternal: false },
  { name: '업무 게시판', href: '/board', icon: <LayoutDashboard size={17} />, isExternal: false },
];

export default function Navbar() {
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

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 h-16 shadow-xs">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        {/* Brand Logo - Crisp & Distinct */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shadow-blue-500/25">
            i
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
              아이센스토어
            </span>
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Live
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links - Larger & More Legible Font */}
        <div className="hidden lg:flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = !item.isExternal && pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13.5px] sm:text-sm font-bold transition-all ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/80'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5 text-sm">
              <span className="text-slate-800 font-bold">{user.email.split('@')[0]}님</span>
              <button 
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-slate-100 font-semibold"
                title="로그아웃"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200"
            >
              로그인
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl"
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-2.5 shadow-xl">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              target={item.isExternal ? '_blank' : undefined}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl text-slate-800 text-sm font-bold hover:bg-blue-50"
            >
              <span className="text-blue-600">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-slate-600 font-medium">{user.email}</span>
                <button onClick={handleLogout} className="text-red-600 font-bold">로그아웃</button>
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
