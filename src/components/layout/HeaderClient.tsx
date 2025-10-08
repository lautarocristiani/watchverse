'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import ThemeSwitcher from '../shared/ThemeSwitcher';
import SearchBar from '../search/SearchBar';
import { Profile } from '@/lib/types';
import Image from 'next/image';
import { LogOut, Edit, ChevronDown, Home, Clapperboard, Tv, List, Search, X, Orbit } from 'lucide-react';

interface HeaderClientProps {
  user: User | null;
  profile: Profile | null;
  logoutAction: () => Promise<void>;
}

export default function HeaderClient({ user: initialUser, profile: initialProfile, logoutAction }: HeaderClientProps) {
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(initialProfile);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
        router.refresh();
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    setUser(initialUser);
    setProfile(initialProfile);
    setIsSearchOpen(false);
  }, [initialUser, initialProfile, pathname]);
  
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isSearchOpen]);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    const baseClasses = 'flex items-center gap-2 rounded-md px-2 md:px-3 py-2 text-sm font-medium transition-colors';
    if (isActive) {
      return `${baseClasses} bg-hover-light text-primary dark:bg-hover-dark`;
    }
    return `${baseClasses} text-text-secondary-light hover:bg-hover-light hover:text-text-main-light dark:text-text-secondary-dark dark:hover:bg-hover-dark dark:hover:text-text-main-dark`;
  };

  const avatarSrc = profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || profile?.username}&background=0ea5e9&color=fff&size=128`;

  return (
    <>
      <div className="flex items-center justify-end flex-grow gap-1 lg:gap-4">
        <div className="flex items-center gap-1">
          <Link href="/" className={getLinkClass('/')} title="Home"><Home size={20} /><span className="hidden lg:inline">Home</span></Link>
          <Link href="/movies" className={getLinkClass('/movies')} title="Movies"><Clapperboard size={20} /><span className="hidden lg:inline">Movies</span></Link>
          <Link href="/series" className={getLinkClass('/series')} title="Series"><Tv size={20} /><span className="hidden lg:inline">Series</span></Link>
          {user && (<Link href="/my-lists" className={getLinkClass('/my-lists')} title="My Lists"><List size={20} /><span className="hidden lg:inline">My Lists</span></Link>)}
        </div>

        <div className="flex items-center gap-1 lg:gap-4">
          <div className="hidden sm:block"><SearchBar /></div>
          
          <button onClick={() => setIsSearchOpen(true)} className="p-2 sm:hidden text-text-secondary-light hover:text-text-main-light dark:text-text-secondary-dark dark:hover:text-text-main-dark transition-colors" title="Search">
            <Search size={20} />
          </button>

          <ThemeSwitcher />
          {user && profile ? (
            <div className="relative" ref={dropdownRef}>
              <button className="flex items-center gap-2 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span className="hidden lg:inline text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{profile.username}</span>
                <Image src={avatarSrc} alt={profile.username} width={32} height={32} className="rounded-full w-8 h-8 object-cover border border-border-light dark:border-border-dark" />
                <ChevronDown className={`w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card-light rounded-md shadow-xl border border-border-light z-20 dark:bg-card-dark dark:border-border-dark">
                  <div className="p-2 border-b border-border-light dark:border-border-dark">
                    <p className="text-sm font-semibold text-text-main-light dark:text-text-main-dark truncate">{profile.username}</p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link href="/profile/edit" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full px-3 py-2 text-sm text-text-secondary-light hover:bg-hover-light rounded-md dark:text-text-secondary-dark dark:hover:bg-hover-dark"><Edit className="w-4 h-4 mr-2" /> Edit Profile</Link>
                    <form action={logoutAction} className="w-full"><button type="submit" className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-hover-light rounded-md dark:hover:bg-hover-dark"><LogOut className="w-4 h-4 mr-2" /> Logout</button></form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="bg-primary hover:bg-primary-hover px-4 py-2 rounded text-sm font-bold text-primary-foreground whitespace-nowrap">Login / Sign Up</Link>
          )}
        </div>
      </div>
      
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-0 z-10 bg-background-light dark:bg-background-dark sm:hidden">
          <div className="container mx-auto px-4 py-3 flex items-center gap-4">
            <div className="flex-grow">
              <SearchBar autoFocus={true} />
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="p-2 text-text-secondary-light hover:text-text-main-light dark:text-text-secondary-dark dark:hover:text-text-main-dark transition-colors" aria-label="Close search">
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}