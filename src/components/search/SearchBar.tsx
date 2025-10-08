'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SearchBarProps {
  autoFocus?: boolean;
}

export default function SearchBar({ autoFocus = false }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');

  useEffect(() => {
    setQuery(searchParams.get('query') || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 3) {
        router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, router]);

  return (
    <div className="relative w-full">
      <input
        type="search"
        name="query"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
        className="w-40 pl-10 pr-4 py-2 text-sm bg-card-light border border-border-light rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:bg-card-dark dark:border-border-dark"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">
        <Search size={18} />
      </div>
    </div>
  );
}