// components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/index';
import { Search, Plus, Compass, Trophy, LogOut, ChevronDown } from 'lucide-react';
import Image from 'next/image';

export function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-surface-primary/80 backdrop-blur-xl border-b border-border-nav z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LEFT SECTION: Clean Navigation */}
        <div className="flex items-center gap-8">
          <NavLink href="/feed/all" icon={<Compass className="w-4 h-4" />} label="Explore" />
          <NavLink href="/rankings" icon={<Trophy className="w-4 h-4" />} label="Rankings" />
        </div>

        {/* MIDDLE SECTION: Stealth Search */}
        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-action-primary transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-secondary/40 border border-border-default focus:border-border-nav rounded-full pl-10 pr-4 py-1.5 text-sm text-text-primary transition-all outline-none placeholder:text-text-muted"
            />
          </form>
        </div>

        {/* RIGHT SECTION: Actions & Dropdown */}
        <div className="flex items-center gap-5">
          {user ? (
            <>
              {/* THE "NEW POST" OVAL: Outline only, No glow, Subtle transition */}
              <Link 
                href="/upload"
                className="flex items-center gap-2 px-4 py-1.5 border border-action-primary text-action-primary hover:bg-action-primary hover:text-white rounded-full transition-all duration-300 font-medium text-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">New Post</span>
              </Link>

              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 group"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border-default group-hover:border-text-muted overflow-hidden flex items-center justify-center transition-colors">
                    {user.avatar ? (
                      <Image 
                        src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-text-primary">
                        {user.username.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-surface-elevated border border-border-default rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-border-muted mb-1">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Account</p>
                      <p className="text-sm text-text-primary font-medium truncate">{user.username}</p>
                    </div>
                    
                    <Link 
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Login</Link>
              <Link href="/login" className="px-5 py-1.5 border border-text-primary text-text-primary hover:bg-text-primary hover:text-surface-primary rounded-full text-sm font-semibold transition-all">
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-2.5 text-text-secondary hover:text-text-primary transition-all group"
    >
      <span className="text-text-muted group-hover:text-action-primary transition-colors">
        {icon}
      </span>
      <span className="text-sm font-medium tracking-tight">{label}</span>
    </Link>
  );
}