// src/middleware/withAuth.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../lib/supabaseClient';

export async function withAuth(req: NextRequest, allowedRoles: string[] = []) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  // Se houver restrição de role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.user_metadata.role)) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}
