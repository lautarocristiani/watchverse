import Link from 'next/link';
import { Orbit } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/lib/supabase/actions';
import HeaderClient from './HeaderClient';
import { getUserProfile } from '@/lib/supabase/queries';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    profile = await getUserProfile(supabase, user.id);
  }

  return (
    <header className="bg-background-light/80 backdrop-blur sticky top-0 z-50 border-b border-border-light dark:bg-background-dark/80 dark:border-border-dark">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-base font-bold text-text-main-light dark:text-text-main-dark">
          <Orbit />
          <span className="hidden sm:inline">WATCHVERSE</span>
        </Link>
        
        <HeaderClient user={user} profile={profile} logoutAction={logoutAction} />
      </nav>
    </header>
  );
}