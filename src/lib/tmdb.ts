import { Genre, Media } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

interface TmdbApiResponse {
    results: Media[];
    total_pages: number;
}

async function fetchFromTMDB(endpoint: string, params: string = '') {
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&${params}`;
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
        console.error(`Error fetching from TMDB: ${response.statusText}`);
        return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`TMDB fetch error: ${error}`);
    return null;
  }
}

function formatResults(data: TmdbApiResponse | null): { results: Media[], total_pages: number } {
    const filteredResults = data?.results.filter((item: Media) => item.poster_path);
    
    const total = data?.total_pages ?? 1;
    
    const total_pages = total > 500 ? 500 : total;

    return {
        results: filteredResults || [],
        total_pages: total_pages,
    };
}

export async function getGenres(mediaType: 'movie' | 'tv'): Promise<Genre[]> {
  const data = await fetchFromTMDB(`/genre/${mediaType}/list`);
  return data?.genres || [];
}

export async function getMediaByFilter(
  mediaType: 'movie' | 'tv', 
  page: number = 1,
  sortBy: string = 'popularity.desc',
  genreId?: string | null
): Promise<{ results: Media[], total_pages: number }> {
  const genreFilter = genreId ? `with_genres=${genreId}` : '';
  const data = await fetchFromTMDB(`/discover/${mediaType}`, `include_adult=false&${genreFilter}&page=${page}&sort_by=${sortBy}`);
  return formatResults(data);
}

export async function getMediaDetails(mediaType: 'movie' | 'tv', id: string): Promise<Media | null> {
  return await fetchFromTMDB(`/${mediaType}/${id}`, `append_to_response=videos,credits,similar`);
}

export async function searchMedia(query: string, page: number = 1): Promise<{ results: Media[], total_pages: number }> {
  const data = await fetchFromTMDB('/search/multi', `query=${encodeURIComponent(query)}&page=${page}&include_adult=false`);
  
  const filteredData = {
    ...data,
    results: data?.results.filter((item: Media) => item.media_type === 'movie' || item.media_type === 'tv'),
  };
  return formatResults(filteredData);
}

export async function getPopularMovies(params: { page: number }): Promise<{ results: Media[], total_pages: number }> {
  const data = await fetchFromTMDB('/movie/popular', `page=${params.page}`);
  return formatResults(data);
}

export async function getTopRatedMovies(params: { page: number }): Promise<{ results: Media[], total_pages: number }> {
  const data = await fetchFromTMDB('/movie/top_rated', `page=${params.page}`);
  return formatResults(data);
}

export async function getMoviesByGenre(genreId: string, params: { page: number }): Promise<{ results: Media[], total_pages: number }> {
  const data = await fetchFromTMDB('/discover/movie', `with_genres=${genreId}&page=${params.page}&sort_by=popularity.desc`);
  return formatResults(data);
}

export async function getPopularTvShows(params: { page: number }): Promise<{ results: Media[], total_pages: number }> {
  const data = await fetchFromTMDB('/tv/popular', `page=${params.page}`);
  return formatResults(data);
}

export async function getTopRatedTvShows(params: { page: number }): Promise<{ results: Media[], total_pages: number }> {
  const data = await fetchFromTMDB('/tv/top_rated', `page=${params.page}`);
  return formatResults(data);
}

export async function getTvShowsByGenre(genreId: string, params: { page: number }): Promise<{ results: Media[], total_pages: number }> {
  const data = await fetchFromTMDB('/discover/tv', `with_genres=${genreId}&page=${params.page}&sort_by=popularity.desc`);
  return formatResults(data);
}