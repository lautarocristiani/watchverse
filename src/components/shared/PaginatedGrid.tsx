'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginatedGridProps {
  children: React.ReactNode;
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function PaginatedGrid({ children, currentPage, totalPages, basePath }: PaginatedGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    const handler = setTimeout(() => {
      const pageNum = parseInt(pageInput, 10);
      if (
        !isNaN(pageNum) &&
        pageNum > 0 &&
        pageNum <= totalPages &&
        pageNum !== currentPage
      ) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(pageNum));
        router.push(`${basePath}?${params.toString()}`);
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [pageInput, currentPage, totalPages, basePath, searchParams, router]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const renderPagination = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);

    const createPageURL = (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));
      return `${basePath}?${params.toString()}`;
    }

    return (
      <div className="flex justify-center items-center gap-2 md:gap-4 mt-12">
        {currentPage > 1 && (
          <Link href={createPageURL(currentPage - 1)} className="w-10 h-10 flex items-center justify-center rounded-md border border-border-light bg-card-light hover:bg-hover-light transition-colors dark:border-border-dark dark:bg-card-dark dark:hover:bg-hover-dark" aria-label="Previous Page">
            <ChevronLeft size={20} />
          </Link>
        )}
        {pages.map(page => (
          <Link
            key={page}
            href={createPageURL(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-md border transition-colors text-sm font-medium ${currentPage === page
                ? 'bg-primary border-primary text-primary-foreground pointer-events-none'
                : 'border-border-light bg-card-light hover:bg-hover-light dark:border-border-dark dark:bg-card-dark dark:hover:bg-hover-dark'
              }`}
          >
            {page}
          </Link>
        ))}

        <div className="hidden md:flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
          / <span className='px-2'>{totalPages}</span>
        </div>

        {currentPage < totalPages && (
          <Link href={createPageURL(currentPage + 1)} className="w-10 h-10 flex items-center justify-center rounded-md border border-border-light bg-card-light hover:bg-hover-light transition-colors dark:border-border-dark dark:bg-card-dark dark:hover:bg-hover-dark" aria-label="Next Page">
            <ChevronRight size={20} />
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {children}
      </div>
      {totalPages > 1 && renderPagination()}
    </>
  );
}