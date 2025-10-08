// src/components/shared/MediaCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
// Asegúrate de importar EnrichedMedia
import { EnrichedMedia } from '@/lib/types';
import MediaCardActions from './MediaCardActions';
import { Star } from 'lucide-react';
import { User } from '@supabase/supabase-js';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface MediaCardProps {
  // Usa el nuevo tipo aquí
  item: EnrichedMedia;
  type: 'movie' | 'tv';
  user: User | null;
  userRating?: number | null;
}

export default function MediaCard({ item, type, user, userRating }: MediaCardProps) {
  const title = item.title || item.name;
  const href = `/${type}/${item.id}`;
  
  const initialWatchlist = item.user_status === 'watchlist';
  const initialWatched = item.user_status === 'watched';

  return (
    <div className="group relative">
      <Link href={href} className="block">
        <div className="overflow-hidden rounded-lg bg-card-light shadow-lg aspect-[2/3] relative dark:bg-card-dark">
          <Image
            src={item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : '/placeholder-poster.svg'}
            alt={`Poster for ${title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-black/60 rounded-lg" />
            <MediaCardActions 
              mediaId={item.id} 
              mediaType={type} 
              initialWatched={initialWatched}
              initialWatchlist={initialWatchlist}
              user={user}
            />
          </div>
        </div>
        <h3 className="mt-2 text-md font-semibold truncate text-text-main-light dark:text-text-main-dark">{title}</h3>
      </Link>
      
      {userRating ? (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-primary-foreground z-10">
          <Star size={12} className="text-primary-foreground fill-primary-foreground" />
          <span>{userRating}/10</span>
        </div>
      ) : (
        item.vote_average > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-background-light/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold z-10 dark:bg-background-dark/70">
            <Star size={12} className="text-star fill-star" />
            <span>{item.vote_average.toFixed(1)}</span>
          </div>
        )
      )}
    </div>
  );
}