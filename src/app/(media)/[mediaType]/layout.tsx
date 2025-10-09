import FilterBar from "@/components/shared/FilterBar";
import { getGenres } from "@/lib/tmdb";
import React from "react";

export async function generateStaticParams() {
  return [{ mediaType: 'movies' }, { mediaType: 'series' }];
}

type MediaLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ mediaType: 'movies' | 'series' }>;
};

export default async function MediaLayout({ children, params }: MediaLayoutProps) {
    const resolvedParams = await params;
    
    const type = resolvedParams.mediaType === 'movies' ? 'movie' : 'tv';
    const genres = await getGenres(type);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <FilterBar genres={genres} />
            {children}
        </div>
    );
}