// src/app/api/notification/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { user_id, message } = await req.json();
    
    // Validação básica
    if (!user_id || !message) {
      return NextResponse.json({ error: 'user_id e message são obrigatórios' }, { status: 400 });
    }

    // Verifica se existe Service Role Key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Service Role Key não configurada. Configure SUPABASE_SERVICE_ROLE_KEY no .env.local' 
      }, { status: 500 });
    }

    // Usa Service Role Key para bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // Insere a notificação
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert([{ 
        user_id, 
        message, 
        read: false 
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao enviar notificação:', error);
      return NextResponse.json({ error: 'Erro ao enviar notificação: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
    
  } catch (error) {
    console.error('Erro na API de notificação:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
