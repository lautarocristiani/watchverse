'use client';

import { useEffect, useState, useMemo } from "react";
import { useInView } from 'react-intersection-observer';
import { getGenreRowData } from "@/lib/supabase/actions"; 
import { Genre, Media, EnrichedMedia } from "@/lib/types";
import GenreRow from "./GenreRow";
import MediaCard from "./MediaCard";
import { User } from "@supabase/supabase-js";

interface LazyGenreRowProps {
    genre: Genre;
    mediaType: 'movie' | 'tv';
    user: User | null;
    watchlistIds: number[];
    watchedIds: number[];
    ratingsMap: Record<number, number>; // <-- 1. ACEPTA LA NUEVA PROP
}

const RowSkeleton = () => (
    <div className="space-y-4">
        <div className="h-8 w-1/4 bg-card-light rounded animate-pulse mb-4 dark:bg-card-dark"></div>
        <div className="flex space-x-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
                    <div className="aspect-[2/3] bg-card-light rounded-lg animate-pulse dark:bg-card-dark"></div>
                    <div className="h-4 mt-2 w-3/4 bg-card-light rounded animate-pulse dark:bg-card-dark"></div>
                </div>
            ))}
        </div>
    </div>
);

//                             👇 2. RECÍBELA AQUÍ
export default function LazyGenreRow({ genre, mediaType, user, watchlistIds, watchedIds, ratingsMap }: LazyGenreRowProps) {
    const [items, setItems] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    useEffect(() => {
        if (inView && items.length === 0 && !isLoading) {
            setIsLoading(true);
            getGenreRowData(mediaType, String(genre.id)).then(data => {
                if (Array.isArray(data)) {
                    setItems(data);
                }
                setIsLoading(false);
            });
        }
    }, [inView, items.length, isLoading, genre.id, mediaType]);

    const enrichedItems: EnrichedMedia[] = useMemo(() => {
        return items.map(item => {
            const status = watchedIds.includes(item.id) ? 'watched' : (watchlistIds.includes(item.id) ? 'watchlist' : null);
            // 3. BUSCA EL RATING EN EL MAPA
            const rating = ratingsMap[item.id] || null;
            //    Y AÑÁDELO AL OBJETO
            return { ...item, user_status: status, user_rating: rating };
        });
    }, [items, watchlistIds, watchedIds, ratingsMap]); // No olvides añadir ratingsMap a las dependencias

    if (items.length === 0) {
        return <div ref={ref}><RowSkeleton /></div>;
    }

    return (
        <GenreRow
            title={genre.name}
            href={`/${mediaType === 'movie' ? 'movies' : 'series'}?genre=${genre.id}`}
        >
            {enrichedItems.map(item => (
                <div key={item.id} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6">
                    <MediaCard 
                        item={item} 
                        type={mediaType} 
                        user={user} 
                        // 4. PASA EL RATING FINAL A MEDIACARD
                        userRating={item.user_rating} 
                    />
                </div>
            ))}
        </GenreRow>
    );
}