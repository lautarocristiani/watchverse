'use client';

import { updateMediaStatus } from '@/lib/supabase/actions';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';

interface MediaActionButtonsProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  initialStatus: 'watchlist' | 'watched' | null;
  isLoggedIn: boolean;
}

export default function MediaActionButtons({ mediaId, mediaType, initialStatus, isLoggedIn }: MediaActionButtonsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (newStatus: 'watchlist' | 'watched') => {
    if (!isLoggedIn) {
      alert('You must be logged in to use this feature.');
      return;
    }
    
    startTransition(async () => {
      const currentStatus = status;
      const optimisticStatus = newStatus === currentStatus ? null : newStatus;
      setStatus(optimisticStatus);

      const result = await updateMediaStatus(
        mediaId,
        mediaType,
        optimisticStatus === null ? 'remove' : newStatus
      );

      if (result?.error) {
        setStatus(currentStatus);
        console.error(result.error);
        alert('Something went wrong. Please try again.');
      }
    });
  };
  
  return (
    <div className="flex flex-wrap gap-4">
      <button
        onClick={() => handleUpdateStatus('watchlist')}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50 ${
          status === 'watchlist'
            ? 'bg-primary hover:bg-primary-hover border-primary text-primary-foreground'
            : 'bg-card-light border-border-light hover:bg-hover-light dark:bg-card-dark dark:border-border-dark dark:hover:bg-hover-dark'
        }`}
      >
        {isPending && status === 'watchlist' ? <Loader2 size={16} className="animate-spin" /> : <Bookmark size={16} />}
        <span>{status === 'watchlist' ? 'On Watchlist' : 'Add to Watchlist'}</span>
      </button>
      <button
        onClick={() => handleUpdateStatus('watched')}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 ${
          status === 'watched'
            ? 'bg-success hover:bg-success-hover border-success text-primary-foreground'
            : 'bg-card-light border-border-light hover:bg-hover-light dark:bg-card-dark dark:border-border-dark dark:hover:bg-hover-dark'
        }`}
      >
        {isPending && status === 'watched' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        <span>{status === 'watched' ? 'Watched' : 'Mark as Watched'}</span>
      </button>
    </div>
  );
}