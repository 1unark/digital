// components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/index';
import { MagnifyingGlass, Plus, Compass, Trophy, SignOut, CaretDown, UserCircle } from '@phosphor-icons/react';
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
    <nav 
      className="fixed top-0 left-0 right-0 h-14 backdrop-blur-xl z-50"
      style={{
        backgroundColor: 'var(--color-surface-nav)',
        borderBottom: '1px solid var(--color-border-nav)'
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LEFT SECTION: Logo + Navigation */}
        <div className="flex items-center gap-8">
          {/* LOGO */}
          <div className="flex items-center">
            <Image 
              src="/favicon.ico" 
              alt="Logo" 
              width={32} 
              height={32}
              className="w-8 h-8"
              priority
              unoptimized
            />
          </div>

          <NavLink href="/feed/all" icon={<Compass size={16} weight="duotone" />} label="Explore" />
          <NavLink href="/rankings" icon={<Trophy size={16} weight="duotone" />} label="Rankings" />
        </div>

        {/* MIDDLE SECTION: Stealth Search */}
        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative group">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" 
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full pl-10 pr-4 py-1.5 text-sm transition-all outline-none"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-border-nav)';
                const icon = e.target.previousElementSibling as HTMLElement;
                if (icon) icon.style.color = 'var(--color-action-primary)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-default)';
                const icon = e.target.previousElementSibling as HTMLElement;
                if (icon) icon.style.color = 'var(--color-text-muted)';
              }}
            />
          </form>
        </div>

        {/* RIGHT SECTION: Actions & Dropdown */}
        <div className="flex items-center gap-5">
          {user ? (
            <>
              {/* NEW POST BUTTON */}
              <Link 
                href="/upload"
                className="flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 font-medium text-sm"
                style={{
                  border: '1px solid var(--color-action-primary)',
                  color: 'var(--color-action-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-action-primary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-action-primary)';
                }}
              >
                <Plus size={16} weight="bold" />
                <span className="hidden sm:inline">New Post</span>
              </Link>

              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 group"
                >
                  <div 
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      border: '1px solid var(--color-border-default)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-text-muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-default)';
                    }}
                  >
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
                      <span 
                        className="text-[10px] font-bold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {user.username.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <CaretDown 
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </button>

                {/* DROPDOWN MENU */}
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-48 shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: '8px'
                    }}
                  >
                    <div 
                      className="px-3 py-2 mb-1"
                      style={{ borderBottom: '1px solid var(--color-border-muted)' }}
                    >
                      <p 
                        className="text-[10px] uppercase tracking-widest font-semibold"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Account
                      </p>
                      <p 
                        className="text-sm font-medium truncate mt-0.5"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {user.username}
                      </p>
                    </div>
                    
                    <Link 
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                      onClick={() => setIsDropdownOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-action-secondary)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }}
                    >
                      <UserCircle size={16} weight="duotone" />
                      My Profile
                    </Link>
                    
                    <div 
                      className="my-1"
                      style={{ 
                        height: '1px',
                        backgroundColor: 'var(--color-border-muted)'
                      }}
                    />
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <SignOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                Login
              </Link>
              <Link 
                href="/login" 
                className="px-5 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  border: '1px solid var(--color-text-primary)',
                  color: 'var(--color-text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
                  e.currentTarget.style.color = 'var(--color-surface-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
              >
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
      className="flex items-center gap-2.5 transition-all group"
    >
      <span 
        className="transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-action-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
      >
        {icon}
      </span>
      <span 
        className="text-sm font-medium tracking-tight transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
      >
        {label}
      </span>
    </Link>
  );
}