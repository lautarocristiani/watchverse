// src/app/my-lists/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getMediaDetails } from '@/lib/tmdb';
import { getUserMediaListByStatus, getUserRatingsMap } from '@/lib/supabase/queries';
import { User } from '@supabase/supabase-js';
import GenreRow from '@/components/shared/GenreRow';
import MediaCard from '@/components/shared/MediaCard';
import { EnrichedMedia } from '@/lib/types';

export default async function MyListsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Obtenemos todos los datos del usuario de una vez, usando la nueva función para ratings
  const [watchlistItems, watchedItems, ratingsMap] = await Promise.all([
    getUserMediaListByStatus(supabase, user.id, 'watchlist'),
    getUserMediaListByStatus(supabase, user.id, 'watched'),
    getUserRatingsMap(supabase, user.id),
  ]);

  // Función auxiliar para obtener detalles y enriquecer
  const getEnrichedDetails = async (
    items: { media_id: number, media_type: string }[],
    status: 'watchlist' | 'watched'
  ): Promise<EnrichedMedia[]> => {
    if (items.length === 0) return [];
    
    const detailsPromises = items.map(item => 
      getMediaDetails(item.media_type as 'movie' | 'tv', String(item.media_id))
    );
    const details = (await Promise.all(detailsPromises)).filter(Boolean);

    // Enriquecemos con el status y el rating del usuario
    return details.map(detail => ({
      ...detail!,
      user_status: status,
      user_rating: ratingsMap[detail!.id] || null,
      media_type: items.find(i => i.media_id === detail!.id)?.media_type as 'movie' | 'tv'
    }));
  };

  const [watchlistDetails, watchedDetails] = await Promise.all([
    getEnrichedDetails(watchlistItems, 'watchlist'),
    getEnrichedDetails(watchedItems, 'watched'),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <section>
        {watchlistDetails.length > 0 ? (
          <GenreRow title="My Watchlist" href="/watchlist">
            {watchlistDetails.map((item) => (
              <div key={`${item.id}-${item.media_type}`} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
                <MediaCard
                  item={item}
                  type={item.media_type!}
                  user={user as User | null}
                  userRating={item.user_rating}
                />
              </div>
            ))}
          </GenreRow>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Watchlist</h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Your watchlist is empty.</p>
          </div>
        )}
      </section>

      <section>
        {watchedDetails.length > 0 ? (
          <GenreRow title="Watched History" href="/watched">
            {watchedDetails.map((item) => (
              <div key={`${item.id}-${item.media_type}`} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
                <MediaCard
                  item={item}
                  type={item.media_type!}
                  user={user as User | null}
                  userRating={item.user_rating}
                />
              </div>
            ))}
          </GenreRow>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">Watched History</h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">You haven't marked any items as watched yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}