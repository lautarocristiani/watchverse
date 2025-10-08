// src/lib/utils.ts

import { Media, EnrichedMedia } from './types';

/**
 * Toma una lista de media de TMDB y la enriquece con los datos del usuario (status y rating).
 * @param mediaList - Array de películas o series desde TMDB.
 * @param watchlistIds - Array de IDs en la watchlist del usuario.
 * @param watchedIds - Array de IDs en la lista de vistos del usuario.
 * @param ratingsMap - Un mapa de { mediaId: rating } de los ratings del usuario.
 * @returns - El mismo array de media, pero con `user_status` y `user_rating` añadidos.
 */
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