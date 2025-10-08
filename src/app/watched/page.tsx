import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserMediaListByStatus } from '@/lib/supabase/queries';
import { getMediaDetails } from '@/lib/tmdb';
import MediaCard from '@/components/shared/MediaCard';
import BackButton from '@/components/shared/BackButton';
import { User } from '@supabase/supabase-js';
import { EnrichedMedia } from '@/lib/types';

export default async function WatchedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    const watchedItems = await getUserMediaListByStatus(supabase, user.id, 'watched');
    
    const mediaDetailsPromises = watchedItems.map(item => 
        getMediaDetails(item.media_type as 'movie' | 'tv', String(item.media_id))
    );

    const mediaDetails = (await Promise.all(mediaDetailsPromises));

    // Usamos .reduce() aquí también para asegurar el tipo correcto
    const mediaOnWatchedList = mediaDetails.reduce<EnrichedMedia[]>((acc, media) => {
        if (media) {
            const originalItem = watchedItems.find(i => i.media_id === media.id);
            acc.push({
                ...media,
                user_status: 'watched', // Asignamos el estado correcto
                media_type: originalItem?.media_type as 'movie' | 'tv'
            });
        }
        return acc;
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
                <div>
                    <BackButton href="/my-lists" />
                    <h1 className="text-3xl font-bold mt-4 text-text-main-light dark:text-text-main-dark">Watched History</h1>
                </div>
                {mediaOnWatchedList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                        {mediaOnWatchedList.map(media => (
                            <MediaCard key={media.id} item={media} type={media.media_type!} user={user as User | null}/>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">You haven&apos;t marked any items as watched yet.</p>
                )}
            </div>
        </div>
    );
}