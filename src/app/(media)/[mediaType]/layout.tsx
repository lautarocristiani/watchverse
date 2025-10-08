import FilterBar from "@/components/shared/FilterBar";
import { getGenres } from "@/lib/tmdb";

export default async function MediaLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { mediaType: 'movies' | 'series' };
}) {
    const type = params.mediaType === 'movies' ? 'movie' : 'tv';
    const genres = await getGenres(type);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <FilterBar genres={genres} />
            {children}
        </div>
    );
}