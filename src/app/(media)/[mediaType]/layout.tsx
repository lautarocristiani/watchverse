import FilterBar from "@/components/shared/FilterBar";
import { getGenres } from "@/lib/tmdb";
import React from "react";


type MediaLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ mediaType: string }>;
};

export default async function MediaLayout({ children, params }: MediaLayoutProps) {
  const { mediaType } = await params;

  const isValid = mediaType === "movies" || mediaType === "series";
  const type = mediaType === "movies" ? "movie" : "tv";

  if (!isValid) {
    console.warn(`Invalid mediaType: ${mediaType}`);
  }

  const genres = await getGenres(type);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <FilterBar genres={genres} />
      {children}
    </div>
  );
}
