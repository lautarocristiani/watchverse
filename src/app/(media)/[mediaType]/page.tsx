import PaginatedGrid from '@/components/shared/PaginatedGrid';
import MediaCard from '@/components/shared/MediaCard';
import GenreRow from '@/components/shared/GenreRow';
import LazyGenreRow from '@/components/shared/LazyGenreRow';
import { getMediaByFilter, getPopularMovies, getTopRatedMovies, getPopularTvShows, getTopRatedTvShows, getGenres } from '@/lib/tmdb';
import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';
import { getUserMediaListByStatus, getUserRatingsMap } from '@/lib/supabase/queries';
import { enrichMedia } from '@/lib/utils';

export async function generateStaticParams() {
  return [{ mediaType: 'movies' }, { mediaType: 'series' }];
}

export default async function MediaTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ mediaType: 'movies' | 'series' }>;
  searchParams: Promise<{ page?: string; sort?: string; genre?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);

  const { mediaType } = resolvedParams;
  const { page, sort, genre } = resolvedSearchParams;

  const type = mediaType === 'movies' ? 'movie' : 'tv';
  const basePath = mediaType === 'movies' ? '/movies' : '/series';
  const isFilteredView = !!sort || !!genre;

  let watchlistIds: number[] = [];
  let watchedIds: number[] = [];
  let ratingsMap: Record<number, number> = {};

  if (user) {
    const [watchlistResult, watchedResult, userRatings] = await Promise.all([
      getUserMediaListByStatus(supabase, user.id, 'watchlist'),
      getUserMediaListByStatus(supabase, user.id, 'watched'),
      getUserRatingsMap(supabase, user.id)
    ]);
    watchlistIds = watchlistResult.map(item => item.media_id);
    watchedIds = watchedResult.map(item => item.media_id);
    ratingsMap = userRatings;
  }
  
  if (isFilteredView) {
    const currentPage = Number(page) || 1;
    const sortBy = sort || 'popularity.desc';
    const { results, total_pages } = await getMediaByFilter(type, currentPage, sortBy, genre);
    
    const enrichedResults = enrichMedia(results, watchlistIds, watchedIds, ratingsMap);

    return (
      <PaginatedGrid currentPage={currentPage} totalPages={total_pages} basePath={basePath}>
        {enrichedResults.map(item => 
          <MediaCard 
            key={item.id} 
            item={item} 
            type={type} 
            user={user as User | null} 
            userRating={item.user_rating}
          />
        )}
      </PaginatedGrid>
    );
  }

  const [popularData, topRatedData, allGenres] = await Promise.all([
    type === 'movie' ? getPopularMovies({ page: 1 }) : getPopularTvShows({ page: 1 }),
    type === 'movie' ? getTopRatedMovies({ page: 1 }) : getTopRatedTvShows({ page: 1 }),
    getGenres(type)
  ]);

  const popularResults = enrichMedia(popularData.results, watchlistIds, watchedIds, ratingsMap);
  const topRatedResults = enrichMedia(topRatedData.results, watchlistIds, watchedIds, ratingsMap);
  const genresToLazyLoad = allGenres.slice(0, 10);

  return (
    <div className="space-y-12">
      <GenreRow title="Popular" href={`${basePath}?sort=popularity.desc`}>
        {popularResults.map(item => (
          <div key={item.id} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
            <MediaCard item={item} type={type} user={user as User | null} userRating={item.user_rating} />
          </div>
        ))}
      </GenreRow>
      
      <GenreRow title="Top Rated" href={`${basePath}?sort=vote_average.desc`}>
        {topRatedResults.map(item => (
          <div key={item.id} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
            <MediaCard item={item} type={type} user={user as User | null} userRating={item.user_rating} />
          </div>
        ))}
      </GenreRow>
      
      {genresToLazyLoad.map(g => (
        <LazyGenreRow 
          key={g.id} 
          genre={g} 
          mediaType={type} 
          user={user as User | null} 
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          ratingsMap={ratingsMap}
        />
      ))}
    </div>
  );
}