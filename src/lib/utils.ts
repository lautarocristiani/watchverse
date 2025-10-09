
import { Media, EnrichedMedia } from './types';

export function enrichMedia(
  mediaList: Media[],
  watchlistIds: number[],
  watchedIds: number[],
  ratingsMap: Record<number, number>
): EnrichedMedia[] {
  
  if (!mediaList || mediaList.length === 0) {
    return [];
  }
  
  return mediaList.map(item => ({
    ...item,
    user_status: watchedIds.includes(item.id) 
      ? 'watched' 
      : (watchlistIds.includes(item.id) ? 'watchlist' : null),
    user_rating: ratingsMap[item.id] || null,
  }));
}