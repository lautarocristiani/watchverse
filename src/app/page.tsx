import GenreRow from '@/components/shared/GenreRow';
import MediaCard from '@/components/shared/MediaCard';
import { getMediaByFilter } from '@/lib/tmdb';
import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';
import { getUserMediaListByStatus, getUserRatingsMap } from '@/lib/supabase/queries';
import { enrichMedia } from '@/lib/utils';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let watchlistIds: number[] = [];
  let watchedIds: number[] = [];
  let ratingsMap: Record<number, number> = {};

  if (user) {
    const [watchlistResult, watchedResult, userRatings] = await Promise.all([
      getUserMediaListByStatus(supabase, user.id, 'watchlist'),
      getUserMediaListByStatus(supabase, user.id, 'watched'),
      getUserRatingsMap(supabase, user.id),
    ]);
    watchlistIds = watchlistResult.map(item => item.media_id);
    watchedIds = watchedResult.map(item => item.media_id);
    ratingsMap = userRatings;
  }

  // Obtenemos los datos de TMDB
  const [
    popularMoviesData,
    nowPlayingMoviesData,
    popularSeriesData,
    topRatedSeriesData
  ] = await Promise.all([
    getMediaByFilter('movie', 1, 'popularity.desc'),
    getMediaByFilter('movie', 1, 'primary_release_date.desc'),
    getMediaByFilter('tv', 1, 'popularity.desc'),
    getMediaByFilter('tv', 1, 'vote_average.desc'),
  ]);

  const popularMovies = enrichMedia(popularMoviesData.results, watchlistIds, watchedIds, ratingsMap);
  const nowPlayingMovies = enrichMedia(nowPlayingMoviesData.results, watchlistIds, watchedIds, ratingsMap);
  const popularSeries = enrichMedia(popularSeriesData.results, watchlistIds, watchedIds, ratingsMap);
  const topRatedSeries = enrichMedia(topRatedSeriesData.results, watchlistIds, watchedIds, ratingsMap);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        <GenreRow title="Popular Movies" href="/movies?sort=popularity.desc">
          {popularMovies.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
              <MediaCard item={item} type="movie" user={user as User | null} userRating={item.user_rating} />
            </div>
          ))}
        </GenreRow>
        <GenreRow title="Now in Cinemas" href="/movies?sort=primary_release_date.desc">
          {nowPlayingMovies.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
              <MediaCard item={item} type="movie" user={user as User | null} userRating={item.user_rating} />
            </div>
          ))}
        </GenreRow>
        <GenreRow title="Popular TV Series" href="/series?sort=popularity.desc">
          {popularSeries.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
              <MediaCard item={item} type="tv" user={user as User | null} userRating={item.user_rating} />
            </div>
          ))}
        </GenreRow>
        <GenreRow title="Top Rated TV Series" href="/series?sort=vote_average.desc">
          {topRatedSeries.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
              <MediaCard item={item} type="tv" user={user as User | null} userRating={item.user_rating} />
            </div>
          ))}
        </GenreRow>
      </div>
    </div>
  );
}