// src/lib/types.ts

export interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genres?: { id: number; name: string }[];
  credits?: { cast: { name: string; profile_path: string }[] };
  videos?: { results: { key: string; type: string }[] };
  similar?: { results: Media[] };
  media_type?: 'movie' | 'tv';
}

// --- AÑADE ESTE NUEVO TIPO ---
export type EnrichedMedia = Media & {
  user_status: 'watchlist' | 'watched' | null;
  user_rating?: number | null;
};
// -----------------------------

export interface Genre {
  id: number;
  name: string;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Review {
  id: number;
  rating: number;
  review_text: string | null;
  is_public: boolean;
  created_at: string;
  profiles: Profile | null;
}