import { Review } from "@/lib/types";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import StarRating from "./StarRating";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-text-secondary-light dark:text-text-secondary-dark">No public reviews yet. Be the first!</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="flex gap-4 border-b border-border-light pb-6 last:border-b-0 dark:border-border-dark">
          <Image
            src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${review.profiles?.username || 'default'}`}
            alt={review.profiles?.username || 'User avatar'}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 object-cover mt-1 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <p className="font-semibold text-text-main-light dark:text-text-main-dark truncate">{review.profiles?.username}</p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 sm:mt-0">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</p>
            </div>
            <div className="-ml-1">
                <StarRating rating={review.rating} isEditable={false} size={16} />
            </div>
            {review.review_text && (
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-2 break-words">{review.review_text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}