// src/lib/supabase/actions.ts
'use server';

import { createClient } from './server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getMoviesByGenre, getTvShowsByGenre } from '../tmdb';

// --- AUTH ACTIONS ---
export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: username.toLowerCase().trim() } },
  });

  if (error) {
    return { error: 'Could not sign up user. ' + error.message };
  }
  return { success: 'Check your email to confirm your account!' };
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Could not sign in. Please check your credentials.' };
  }
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// --- PROFILE ACTIONS ---
export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'User not found' };

  const fullName = formData.get('fullName') as string;
  const username = formData.get('username') as string;
  const avatarFile = formData.get('avatar') as File;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fullName, username: username.toLowerCase().trim(), updated_at: new Date().toISOString() })
    .eq('id', user.id);
  
  if (profileError) {
    return { error: 'Could not update profile. Username might be taken.' };
  }

  if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}.${fileExt}`;
      
      const { error: storageError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

      if (storageError) {
          return { error: 'Could not upload avatar.' };
      }
      
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const uniqueUrl = `${publicUrl}?t=${new Date().getTime()}`;
      
      const { error: urlError } = await supabase.from('profiles').update({ avatar_url: uniqueUrl }).eq('id', user.id);
      if (urlError) {
          return { error: 'Could not update avatar URL.' };
      }
  }
  
  revalidatePath('/', 'layout');
  revalidatePath('/profile/edit');
  return { success: 'Profile updated successfully.' };
}

export async function sendPasswordResetAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: 'User not found or email is missing.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  });

  if (error) {
    console.error('Password reset error:', error);
    return { error: 'Could not send password reset link. Please try again later.' };
  }

  return { success: 'Password reset link has been sent to your email.' };
}


// --- REVIEW ACTIONS ---
export async function addOrUpdateReviewAction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be logged in to leave a review.' };

    const mediaId = Number(formData.get('mediaId'));
    const mediaType = formData.get('mediaType') as 'movie' | 'tv';
    const rating = Number(formData.get('rating'));
    const reviewText = formData.get('reviewText') as string;
    const isPublic = formData.get('isPublic') === 'true';

    const reviewData = {
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
        rating,
        review_text: reviewText,
        is_public: isPublic,
    };

    const { error } = await supabase.from('reviews').upsert(reviewData, { onConflict: 'user_id, media_id, media_type' });

    if (error) {
        console.error('Review upsert error:', error);
        return { error: 'Could not save your review.' };
    }

    revalidatePath(`/${mediaType}/${mediaId}`);
    revalidatePath('/my-list');
    return { success: 'Review saved!' };
}

export async function deleteReviewAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete a review.' };
  }

  const reviewId = formData.get('reviewId') as string;
  const mediaId = formData.get('mediaId') as string;
  const mediaType = formData.get('mediaType') as string;

  if (!reviewId || !mediaId || !mediaType) {
    return { error: 'Missing required data to delete review.' };
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Delete review error:', error);
    return { error: 'Failed to delete review. Please try again.' };
  }

  revalidatePath(`/${mediaType}/${mediaId}`);
  revalidatePath('/my-list');
  return { success: 'Review deleted successfully.' };
}

export async function updateMediaStatus(
  mediaId: number,
  mediaType: 'movie' | 'tv',
  status: 'watchlist' | 'watched' | 'remove'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to perform this action.' };
  }
  
  if (status === 'remove') {
    const { error } = await supabase
      .from('user_media_status')
      .delete()
      .match({ user_id: user.id, media_id: mediaId, media_type: mediaType });
    if (error) return { error: 'Could not remove item from list.' };
  } else {
    const { error } = await supabase
      .from('user_media_status')
      .upsert(
        { user_id: user.id, media_id: mediaId, media_type: mediaType, status: status },
        { onConflict: 'user_id, media_id, media_type' }
      );
    if (error) return { error: 'Could not update item status.' };
  }

  revalidatePath('/my-list');
  revalidatePath('/watchlist');
  revalidatePath('/watched');
  
  return { success: true };
}

export async function getGenreRowData(mediaType: 'movie' | 'tv', genreId: string) {
    try {
        if (mediaType === 'movie') {
            const data = await getMoviesByGenre(genreId, { page: 1 });
            return data.results;
        } else {
            const data = await getTvShowsByGenre(genreId, { page: 1 });
            return data.results;
        }
    } catch (error) {
        console.error("Server Action Error fetching genre data:", error);
        return [];
    }
}