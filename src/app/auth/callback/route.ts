// src/app/auth/callback/route.ts

import { createClient } from '@/lib/supabase/server'; 
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // --- CORRECCIÓN AQUÍ ---
    // Añadimos 'await' porque createClient() es una función asíncrona.
    const supabase = await createClient(); 
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Para el flujo de reseteo de contraseña, Supabase Auth Helpers se encarga de la
      // redirección final a la URL que especificaste en tu Server Action (`/auth/update-password`).
      // Aquí podemos simplemente redirigir a la página principal como un fallback seguro.
      return NextResponse.redirect(requestUrl.origin);
    }
  }

  console.error('ERROR: Auth code exchange failed.');
  // Si hay un error, redirigir a una página de error o a la de login.
  return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth_error`);
}