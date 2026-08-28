'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, MessageSquare, Navigation, FileText, Zap, LayoutDashboard, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const NAV_ITEMS = [
  { name: 'AI 챗봇', href: 'https://chatbot.aisen.store', icon: <Bot size={14} />, isExternal: true },
  { name: '구글 챗봇', href: '/chatbot', icon: <MessageSquare size={14} />, isExternal: false },
  { name: '출장비 계산기', href: 'https://chatbot.aisen.store/travel', icon: <Navigation size={14} />, isExternal: true },
  { name: '행정 자료실', href: '/archive', icon: <FileText size={14} />, isExternal: false },
  { name: '미니 프로그램', href: '/tools', icon: <Zap size={14} />, isExternal: false },
  { name: '업무 게시판', href: '/board', icon: <LayoutDashboard size={14} />, isExternal: false },
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
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 h-14">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
            i
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              아이센스토어
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Live
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = !item.isExternal && pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-300 font-medium">{user.email.split('@')[0]}님</span>
              <button 
                onClick={handleLogout}
                className="text-[11px] text-slate-400 hover:text-red-400 px-2 py-1 rounded hover:bg-slate-800"
                title="로그아웃"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              로그인
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-5 py-4 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              target={item.isExternal ? '_blank' : undefined}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2 rounded-lg text-slate-200 text-xs font-medium hover:bg-slate-900"
            >
              <span className="text-blue-400">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-slate-400">{user.email}</span>
                <button onClick={handleLogout} className="text-red-400 font-medium">로그아웃</button>
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-blue-600 text-white font-medium text-xs"
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
