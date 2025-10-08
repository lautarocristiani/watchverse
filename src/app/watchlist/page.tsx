import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserMediaListByStatus } from '@/lib/supabase/queries';
import { getMediaDetails } from '@/lib/tmdb';
import MediaCard from '@/components/shared/MediaCard';
import BackButton from '@/components/shared/BackButton';
import { User } from '@supabase/supabase-js';
import { EnrichedMedia } from '@/lib/types';

export default async function WatchlistPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    const watchlistItems = await getUserMediaListByStatus(supabase, user.id, 'watchlist');
    
    const mediaDetailsPromises = watchlistItems.map(item => 
        getMediaDetails(item.media_type as 'movie' | 'tv', String(item.media_id))
    );

    const mediaDetails = (await Promise.all(mediaDetailsPromises));

    // Usamos .reduce() para construir un array limpio y con el tipo correcto
    const mediaOnWatchlist = mediaDetails.reduce<EnrichedMedia[]>((acc, media) => {
        // Si el 'media' no es nulo, lo procesamos y lo añadimos al acumulador 'acc'
        if (media) {
            const originalItem = watchlistItems.find(i => i.media_id === media.id);
            acc.push({
                ...media,
                user_status: 'watchlist', // Asignamos el estado correcto
                media_type: originalItem?.media_type as 'movie' | 'tv'
            });
        }
        return acc;
    }, []); // El '[]' inicializa el acumulador como un array vacío de EnrichedMedia

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
                <div>
                    <BackButton href="/my-lists" />
                    <h1 className="text-3xl font-bold mt-4 text-text-main-light dark:text-text-main-dark">My Watchlist</h1>
                </div>
                {mediaOnWatchlist.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                        {mediaOnWatchlist.map(media => (
                            <MediaCard key={media.id} item={media} type={media.media_type!} user={user as User | null}/>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">Your watchlist is empty.</p>
                )}
            </div>
        </div>
    );
}