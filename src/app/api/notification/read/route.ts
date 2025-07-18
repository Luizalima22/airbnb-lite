// src/app/api/notification/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
