import { SupabaseClient } from '@supabase/supabase-js';
import { Review, Profile } from '../types';

// SIN CAMBIOS EN ESTA PARTE...

export async function getMediaStatus(supabase: SupabaseClient, userId: string, mediaId: number, mediaType: 'movie' | 'tv') {
  const { data } = await supabase
    .from('user_media_status')
    .select('status')
    .eq('user_id', userId)
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .single();
  
  return data?.status as 'watchlist' | 'watched' | null;
}

export async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
    }
    return data;
}

export async function getReviewsForMedia(supabase: SupabaseClient, mediaId: number, mediaType: 'movie' | 'tv'): Promise<{ reviews: Review[], average: number }> {
    const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(*)')
        .eq('media_id', mediaId)
        .eq('media_type', mediaType)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews', error.message);
        return { reviews: [], average: 0 };
    }

    const reviews = data as Review[];
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = reviews.length > 0 ? totalRating / reviews.length : 0;

    return { reviews, average };
}

export async function getUserReviewForMedia(supabase: SupabaseClient, userId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<Review | null> {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType)
        .single();
    
    if (error) return null;
    return data as Review;
}

export async function getUserRatingsMap(supabase: SupabaseClient, userId: string): Promise<Record<number, number>> {
    const { data, error } = await supabase
        .from('reviews')
        .select('media_id, rating')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user ratings:', error.message);
        return {};
    }

    // Convertimos el array en un objeto mapa para búsquedas rápidas: { media_id: rating }
    const ratingsMap = data.reduce<Record<number, number>>((acc, review) => {
        acc[review.media_id] = review.rating;
        return acc;
    }, {});
    
    return ratingsMap;
}

// --- FIN DE LA FUNCIÓN NUEVA ---

export async function getUserMediaListByStatus(supabase: SupabaseClient, userId: string, status: 'watchlist' | 'watched') {
    const { data } = await supabase
        .from('user_media_status')
        .select('media_id, media_type')
        .eq('user_id', userId)
        .eq('status', status);
    
    return data || [];
}

export async function getMediaStatusBatch(
    supabase: SupabaseClient,
    userId: string,
    mediaIds: number[],
    mediaType: 'movie' | 'tv'
) {
    const { data, error } = await supabase
        .from('user_media_status')
        .select('media_id, status')
        .eq('user_id', userId)
        .eq('media_type', mediaType)
        .in('media_id', mediaIds);

    if (error) {
        console.error('Error fetching media status batch:', error);
        return {};
    }

    const statusMap = data.reduce((acc, item) => {
        acc[item.media_id] = item.status;
        return acc;
    }, {} as Record<number, 'watchlist' | 'watched'>);

    return statusMap;
}