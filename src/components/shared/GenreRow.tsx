'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GenreRowProps {
  title: string;
  href?: string;
  children: React.ReactNode;
}

export default function GenreRow({ title, href, children }: GenreRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setCanScrollLeft(container.scrollLeft > 5);
      setCanScrollRight(hasOverflow && container.scrollLeft < container.scrollWidth - container.clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScrollability();
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(container);
    container.addEventListener('scroll', checkScrollability, { passive: true });
    return () => {
      resizeObserver.disconnect();
      if (container) {
        container.removeEventListener('scroll', checkScrollability);
      }
    };
  }, [children, checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {href && (
          <Link href={href} className="text-primary hover:text-primary-hover transition-colors text-sm font-semibold">
            View all
          </Link>
        )}
      </div>

      <div className="relative group/row">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute top-1/2 left-0 z-20 -translate-y-1/2 -translate-x-4 h-12 w-12 rounded-full bg-background-light/50 backdrop-blur-sm border border-border-light flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover/row:opacity-100 dark:bg-background-dark/50 dark:border-border-dark"
            aria-label="Scroll left"
          >
            <ChevronLeft />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-scroll scroll-smooth scrollbar-hide space-x-4 pb-4 -mb-4"
        >
          {children}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute top-1/2 right-0 z-20 -translate-y-1/2 translate-x-4 h-12 w-12 rounded-full bg-background-light/50 backdrop-blur-sm border border-border-light flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover/row:opacity-100 dark:bg-background-dark/50 dark:border-border-dark"
            aria-label="Scroll right"
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </section>
  );
}