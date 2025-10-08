// src/app/search/page.tsx

import MediaCard from "@/components/shared/MediaCard";
import PaginatedGrid from "@/components/shared/PaginatedGrid";
import { searchMedia } from "@/lib/tmdb";
import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { getMediaStatusBatch } from "@/lib/supabase/queries";
import { EnrichedMedia, Media } from "@/lib/types";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string; page?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { query: searchQuery, page: pageParam } = searchParams;
  
  const query = searchQuery || "";
  const page = Number(pageParam) || 1;

  const { results: media, total_pages } = await searchMedia(query, page);

  let enrichedMedia: EnrichedMedia[] = media.map(m => ({ ...m, user_status: null }));

  if (user && media.length > 0) {
    const movieIds = media.filter(m => m.media_type === 'movie').map(m => m.id);
    const tvIds = media.filter(m => m.media_type === 'tv').map(m => m.id);

    const [movieStatusMap, tvStatusMap] = await Promise.all([
        getMediaStatusBatch(supabase, user.id, movieIds, 'movie'),
        getMediaStatusBatch(supabase, user.id, tvIds, 'tv')
    ]);

    const statusMap = { ...movieStatusMap, ...tvStatusMap };

    enrichedMedia = media.map(item => ({
      ...item,
      user_status: statusMap[item.id] || null
    }));
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">
        Results for: <span className="text-primary">{query}</span>
      </h1>
      {enrichedMedia.length > 0 ? (
        <PaginatedGrid
          currentPage={page}
          totalPages={total_pages}
          basePath={`/search?query=${query}`}
        >
          {enrichedMedia.map(item => (
            item.media_type && <MediaCard key={item.id} item={item} type={item.media_type} user={user as User | null} />
          ))}
        </PaginatedGrid>
      ) : (
        <p className="text-text-secondary-light dark:text-text-secondary-dark">No results found for your search.</p>
      )}
    </div>
  );
}