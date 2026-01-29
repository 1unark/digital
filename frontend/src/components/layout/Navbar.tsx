// components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/index';
import { MagnifyingGlass, Plus, Compass, Trophy, SignOut, CaretDown, UserCircle, Bell } from '@phosphor-icons/react';
import Image from 'next/image';
import { notificationsService, Notification } from '../../services/notifications.service';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Fetch notifications when dropdown opens
  const handleNotifClick = async () => {
    setIsNotifOpen(!isNotifOpen);
    
    if (!isNotifOpen && notifications.length === 0) {
      try {
        const data = await notificationsService.getNotifications(1);
        setNotifications(data.results);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.action_url) {
      router.push(notification.action_url);
      setIsNotifOpen(false);
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
          <div className="flex items-center">
            <Image 
              src="/favicon.ico" 
              alt="Logo" 
              width={32} 
              height={32}
              className="w-8 h-8"
              priority
              unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === 'true'}
            />
          </div>

          <NavLink href="/feed/all" icon={<Compass size={16} weight="duotone" />} label="Explore" />
          <NavLink href="/rankings" icon={<Trophy size={16} weight="duotone" />} label="Rankings" />
        </div>

        {/* RIGHT SECTION: Actions & Dropdown */}
        <div className="flex items-center gap-5">
          {user ? (
            <>
              {/* NOTIFICATION BELL */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleNotifClick}
                  className="relative p-2 rounded-full transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-action-secondary)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                  }}
                >
                  <Bell size={20} weight={unreadCount > 0 ? 'fill' : 'regular'} />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--color-action-primary)',
                        color: 'white'
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATIONS DROPDOWN */}
                {isNotifOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-96 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[500px] overflow-y-auto"
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: '12px'
                    }}
                  >
                    <div 
                      className="px-4 py-3 sticky top-0 z-10 flex items-center justify-between"
                      style={{ 
                        backgroundColor: 'var(--color-surface-secondary)',
                        borderBottom: '1px solid var(--color-border-default)'
                      }}
                    >
                      <p 
                        className="text-sm font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Notifications
                      </p>
                      {unreadCount > 0 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await notificationsService.markAllAsRead();
                            setUnreadCount(0);
                            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                          }}
                          className="text-xs font-medium px-2 py-1 rounded transition-colors"
                          style={{ color: 'var(--color-action-primary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-action-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p 
                          className="text-sm"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className="w-full px-4 py-3 text-left transition-colors border-b last:border-b-0"
                            style={{
                              backgroundColor: notif.is_read ? 'transparent' : 'var(--color-surface-elevated)',
                              borderColor: 'var(--color-border-muted)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-action-secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = notif.is_read ? 'transparent' : 'var(--color-surface-elevated)';
                            }}
                          >
                            <div className="flex gap-3">
                              <div 
                                className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                                style={{
                                  backgroundColor: 'var(--color-surface-primary)',
                                  border: '1px solid var(--color-border-default)'
                                }}
                              >
                                {notif.actor.avatar ? (
                                  <Image 
                                    src={notif.actor.avatar.startsWith('http') ? notif.actor.avatar : `${process.env.NEXT_PUBLIC_API_URL}${notif.actor.avatar}`}
                                    alt={notif.actor.username}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                    unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === 'true'}
                                  />
                                ) : (
                                  <span 
                                    className="text-xs font-bold"
                                    style={{ color: 'var(--color-text-primary)' }}
                                  >
                                    {notif.actor.username.substring(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="text-sm font-medium"
                                  style={{ color: 'var(--color-text-primary)' }}
                                >
                                  {notif.message}
                                </p>
                                {notif.preview && (
                                  <p 
                                    className="text-xs mt-1 line-clamp-2"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    {notif.preview}
                                  </p>
                                )}
                                <p 
                                  className="text-xs mt-1"
                                  style={{ color: 'var(--color-text-muted)' }}
                                >
                                  {formatTimeAgo(notif.created_at)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      border: '1px solid var(--color-border-default)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-action-primary)';
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
                        unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === 'true'}
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
                    className="absolute right-0 mt-3 w-48 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: '12px'
                    }}
                  >
                    <div 
                      className="px-3 py-2 mb-1"
                      style={{ borderBottom: '1px solid var(--color-border-default)' }}
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
                        backgroundColor: 'var(--color-border-default)'
                      }}
                    />
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                      style={{ color: 'var(--color-action-primary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)';
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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}