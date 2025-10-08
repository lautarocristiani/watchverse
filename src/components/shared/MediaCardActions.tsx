'use client';

import { updateMediaStatus } from '@/lib/supabase/actions';
import { BookmarkPlus, BookmarkCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { User } from '@supabase/supabase-js';

interface MediaCardActionsProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  initialWatchlist: boolean;
  initialWatched: boolean;
  user: User | null;
}

export default function MediaCardActions({ mediaId, mediaType, initialWatchlist, initialWatched, user }: MediaCardActionsProps) {
  const [onWatchlist, setOnWatchlist] = useState(initialWatchlist);
  const [isWatched, setIsWatched] = useState(initialWatched);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.MouseEvent, statusToUpdate: 'watchlist' | 'watched') => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // --- LÍNEA CORREGIDA ---
      alert('You must be logged in to add content to your lists.');
      return;
    }

    startTransition(async () => {
      let newStatus: 'watchlist' | 'watched' | 'remove';

      if (statusToUpdate === 'watchlist') {
        newStatus = onWatchlist ? 'remove' : 'watchlist';
        setOnWatchlist(!onWatchlist);
        if (newStatus === 'watchlist') setIsWatched(false);
      } else {
        newStatus = isWatched ? 'remove' : 'watched';
        setIsWatched(!isWatched);
        if (newStatus === 'watched') setOnWatchlist(false);
      }

      await updateMediaStatus(mediaId, mediaType, newStatus);
    });
  };

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-2">
      <button
        onClick={(e) => handleUpdate(e, 'watchlist')}
        disabled={isPending}
        title={onWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        className={`p-2 rounded-full transition-colors ${onWatchlist
          ? 'bg-primary hover:bg-primary-hover text-primary-foreground'
          : 'bg-background-light/70 text-text-main-light hover:bg-primary hover:text-primary-foreground dark:bg-background-dark/70 dark:text-text-main-dark'
          }`}>
        {isPending ? <Loader2 size={18} className="animate-spin" /> : (onWatchlist ? <BookmarkCheck size={18} /> : <BookmarkPlus size={18} />)}
      </button>
      <button
        onClick={(e) => handleUpdate(e, 'watched')}
        disabled={isPending}
        title={isWatched ? 'Mark as Unwatched' : 'Mark as Watched'}
        className={`p-2 rounded-full transition-colors ${isWatched
            ? 'bg-success hover:bg-success-hover text-primary-foreground'
            : 'bg-background-light/70 text-text-main-light hover:bg-primary hover:text-primary-foreground dark:bg-background-dark/70 dark:text-text-main-dark'
          }`}>
        {isPending ? <Loader2 size={18} className="animate-spin" /> : (isWatched ? <Eye size={18} /> : <EyeOff size={18} />)}
      </button>
    </div>
  );
}