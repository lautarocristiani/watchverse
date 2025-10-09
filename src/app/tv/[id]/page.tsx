import { getMediaDetails } from '@/lib/tmdb';
import { getMediaStatus, getReviewsForMedia, getUserReviewForMedia, getUserMediaListByStatus, getUserRatingsMap } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import GenreRow from '@/components/shared/GenreRow';
import MediaActionButtons from '@/components/shared/MediaActionButtons';
import BackButton from '@/components/shared/BackButton';
import MediaCard from '@/components/shared/MediaCard';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import { Star } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { enrichMedia } from '@/lib/utils';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w500';

export default async function TvShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const mediaType = 'tv';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const tvId = Number(id);

    const tvShow = await getMediaDetails(mediaType, id);

    if (!tvShow) {
        return <div className="p-8">TV Show not found.</div>;
    }
    
    const [mediaStatus, { reviews, average }, userReview, watchlistItems, watchedItems, ratingsMap] = await Promise.all([
        user ? getMediaStatus(supabase, user.id, tvId, mediaType) : null,
        getReviewsForMedia(supabase, tvId, mediaType),
        user ? getUserReviewForMedia(supabase, user.id, tvId, mediaType) : null,
        user ? getUserMediaListByStatus(supabase, user.id, 'watchlist') : [],
        user ? getUserMediaListByStatus(supabase, user.id, 'watched') : [],
        user ? getUserRatingsMap(supabase, user.id) : {},
    ]);

    const watchlistIds = watchlistItems.map(item => item.media_id);
    const watchedIds = watchedItems.map(item => item.media_id);
    
    const similarTvShows = tvShow.similar ? enrichMedia(tvShow.similar.results, watchlistIds, watchedIds, ratingsMap) : [];

    const trailer = tvShow.videos?.results.find(v => v.type === 'Trailer');
    const title = tvShow.name || 'Untitled TV Show';

    return (
        <div className="pb-16">
            <section className="relative h-[50vh] md:h-[60vh]">
                <BackButton href="/series" />
                {tvShow.backdrop_path && (
                    <Image src={`${TMDB_IMAGE_BASE_URL}${tvShow.backdrop_path}`} alt={`Backdrop for ${title}`} fill className="object-cover object-top" priority />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/80 to-transparent dark:from-background-dark dark:via-background-dark/80" />
            </section>
            
            <div className='container mx-auto px-4'>
                <section className="flex flex-col md:flex-row gap-8 -mt-[25vh] z-10 relative">
                    <div className="w-full max-w-[200px] md:max-w-[250px] mx-auto md:mx-0 flex-shrink-0">
                        <Image
                            src={tvShow.poster_path ? `${TMDB_POSTER_URL}${tvShow.poster_path}` : '/placeholder-poster.svg'}
                            alt={`Poster for ${title}`}
                            width={300}
                            height={450}
                            className="rounded-lg shadow-2xl"
                        />
                    </div>
                    <div className="w-full md:w-3/4 pt-4 md:pt-16 text-center md:text-left space-y-4">
                        <h1 className="text-3xl md:text-5xl font-bold">{title}</h1>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center md:justify-start items-center">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">{tvShow.first_air_date?.substring(0, 4)}</span>
                            <div className="flex items-center gap-2" title="TMDb Rating">
                                <Star size={16} className="text-star fill-star" />
                                <span className="font-bold">{tvShow.vote_average.toFixed(1)}</span>
                                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">(TMDb)</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {tvShow.genres?.map(g => (
                                <span key={g.id} className="bg-card-light px-3 py-1 text-xs rounded-full border border-border-light dark:bg-card-dark dark:border-border-dark">{g.name}</span>
                            ))}
                        </div>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed max-w-2xl mx-auto md:mx-0 pt-2">{tvShow.overview}</p>
                        <div className="pt-4 flex justify-center md:justify-start">
                            <MediaActionButtons mediaId={tvShow.id} mediaType={mediaType} initialStatus={mediaStatus} isLoggedIn={!!user} />
                        </div>
                    </div>
                </section>

                <div className="space-y-16 mt-16">
                    {trailer && (
                        <section className="max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold mb-4">Trailer</h2>
                            <div className="aspect-video">
                                <iframe src={`https://www.youtube.com/embed/${trailer.key}`} title="Trailer" allowFullScreen className="w-full h-full rounded-lg border border-border-light dark:border-border-dark"></iframe>
                            </div>
                        </section>
                    )}

                    <section>
                        <div className="flex gap-4 items-baseline">
                            <h2 className="text-2xl font-bold text-primary ">Reviews</h2>
                            {reviews.length > 0 && (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-primary">{average.toFixed(1)}</span>
                                    <span className="text-2xl text-text-secondary-light dark:text-text-secondary-dark">/ 10</span>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark pl-2">({reviews.length} review(s))</p>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
                            <div className="order-2 lg:order-1 space-y-6">
                                <h3 className="text-lg font-semibold">What others are saying</h3>
                                <ReviewList reviews={reviews} />
                            </div>
                            <div className="order-1 lg:order-2">
                                {user ? <ReviewForm mediaId={tvId} mediaType={mediaType} userReview={userReview} /> : <p className="text-text-secondary-light dark:text-text-secondary-dark">You must be logged in to leave a review.</p>}
                            </div>
                        </div>
                    </section>

                    {similarTvShows.length > 0 && (
                        <section>
                            <GenreRow title="You might also like">
                                {similarTvShows.map((item) => (
                                    item.poster_path &&
                                    <div key={item.id} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
                                        <MediaCard 
                                            item={item} 
                                            type="tv" 
                                            user={user as User | null} 
                                            userRating={item.user_rating}
                                        />
                                    </div>
                                ))}
                            </GenreRow>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}