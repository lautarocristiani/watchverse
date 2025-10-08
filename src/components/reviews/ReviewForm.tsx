'use client';

import { useState, useTransition, useEffect } from 'react';
import { addOrUpdateReviewAction, deleteReviewAction } from '@/lib/supabase/actions';
import { Review } from '@/lib/types';
import { Loader2, Check, X, Trash2 } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewFormProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  userReview: Review | null;
}

export default function ReviewForm({ mediaId, mediaType, userReview }: ReviewFormProps) {
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [text, setText] = useState(userReview?.review_text || '');
  const [isPublic, setIsPublic] = useState(userReview?.is_public ?? true);
  const [isDirty, setIsDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const hasChanged = rating !== (userReview?.rating || 0) || text !== (userReview?.review_text || '') || isPublic !== (userReview?.is_public ?? true);
    setIsDirty(hasChanged);
  }, [rating, text, isPublic, userReview]);

  const handleCancel = () => {
    setRating(userReview?.rating || 0);
    setText(userReview?.review_text || '');
    setIsPublic(userReview?.is_public ?? true);
  };

  const clientAction = async (formData: FormData) => {
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    startTransition(async () => {
      setMessage('');
      setError('');
      formData.set('rating', String(rating));
      formData.set('isPublic', String(isPublic));

      const result = await addOrUpdateReviewAction(formData);
      
      if (result.error) setError(result.error);
      if (result.success) setMessage(result.success);
    });
  };

  const handleDelete = async () => {
    if (!userReview || !window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      // --- LÍNEA CORREGIDA ---
      // Convertimos el 'id' numérico a un 'string' para FormData
      formData.append('reviewId', String(userReview.id));
      formData.append('mediaId', String(mediaId));
      formData.append('mediaType', mediaType);
      await deleteReviewAction(formData);
    });
  };

  return (
    <form action={clientAction} className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark space-y-4 h-fit sticky top-24">
      <div className="flex justify-between items-start">
        <div>
            <h3 className="text-lg font-semibold">{userReview ? 'Your Review' : 'Leave a Review'}</h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Your rating is always public.</p>
        </div>
        <div className="flex items-center gap-2 -mt-1 -mr-2">
            {isDirty && (
                <>
                    <button type="submit" disabled={isPending} title="Save Changes" className="p-2 rounded-full text-success hover:bg-hover-light dark:hover:bg-hover-dark disabled:opacity-50">
                        {isPending ? <Loader2 className="animate-spin" /> : <Check />}
                    </button>
                    <button type="button" onClick={handleCancel} title="Cancel Changes" className="p-2 rounded-full text-destructive hover:bg-hover-light dark:hover:bg-hover-dark">
                        <X />
                    </button>
                </>
            )}
            {userReview && !isDirty && (
                <button type="button" onClick={handleDelete} disabled={isPending} title="Delete Review" className="p-2 rounded-full text-destructive hover:bg-hover-light dark:hover:bg-hover-dark disabled:opacity-50">
                     {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                </button>
            )}
        </div>
      </div>

      <input type="hidden" name="mediaId" value={mediaId} />
      <input type="hidden" name="mediaType" value={mediaType} />
      
      <div>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      <div>
        <label htmlFor="reviewText" className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">Your Opinion (optional)</label>
        <textarea
          id="reviewText"
          name="reviewText"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full mt-1 p-3 bg-background-light rounded-md border border-border-light focus:ring-primary focus:border-primary dark:bg-background-dark dark:border-border-dark"
          placeholder="What did you think?"
        />
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="isPublicCheckbox" 
          name="isPublicCheckbox" 
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-border-light text-primary focus:ring-primary dark:border-border-dark"
        />
        <label htmlFor="isPublicCheckbox" className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Make opinion public</label>
      </div>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      {message && <p className="text-sm text-success mt-2">{message}</p>}
    </form>
  );
}