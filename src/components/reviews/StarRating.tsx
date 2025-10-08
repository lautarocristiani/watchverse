'use client';

import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  isEditable?: boolean;
  size?: number;
}

export default function StarRating({ rating, setRating, isEditable = true, size = 24 }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (!isEditable || !setRating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    setHover(index + (isHalf ? 0.5 : 1));
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (!isEditable || !setRating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    const newRating = index + (isHalf ? 0.5 : 1);
    setRating(rating === newRating ? 0 : newRating);
  };

  return (
    <div className="flex items-center gap-0.5 mt-1 flex-wrap">
      {[...Array(10)].map((_, index) => {
        const value = index + 1;
        const displayValue = hover || rating;

        let starIcon = <Star size={size} className="text-border-light dark:text-border-dark" />;
        
        if (displayValue >= value) {
          starIcon = <Star size={size} className="text-primary fill-primary" />;
        } else if (displayValue >= value - 0.5) {
          starIcon = <StarHalf size={size} className="text-primary fill-primary" />;
        }

        if (isEditable) {
          return (
            <button
              type="button"
              key={value}
              onClick={(e) => handleClick(e, index)}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={() => setHover(0)}
              className="cursor-pointer"
              aria-label={`Rate ${value} out of 10`}
            >
              {starIcon}
            </button>
          );
        }

        return <div key={value}>{starIcon}</div>;
      })}
    </div>
  );
}