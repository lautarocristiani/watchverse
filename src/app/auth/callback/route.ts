// src/app/auth/callback/route.ts

import { createClient } from '@/lib/supabase/server'; 
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient(); 
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(requestUrl.origin);
    }
  }

  console.error('ERROR: Auth code exchange failed.');
  return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth_error`);
}