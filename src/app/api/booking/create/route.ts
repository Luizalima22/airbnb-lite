import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { property_id, client_id, start_date, end_date, total_price } = await req.json();
    
    // Validação básica
    if (!property_id || !client_id || !start_date || !end_date || !total_price) {
      return NextResponse.json({ error: 'Dados obrigatórios não informados' }, { status: 400 });
    }

    // Verifica se existe Service Role Key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      // Se não tem Service Role Key, usa client normal mas desabilita RLS temporariamente
      return NextResponse.json({ 
        error: 'Service Role Key não configurada. Configure SUPABASE_SERVICE_ROLE_KEY no .env.local' 
      }, { status: 500 });
    }

    // Usa Service Role Key para bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );
    
    // Verifica se o cliente existe e tem role correto
    const { data: clientProfile, error: clientError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', client_id)
      .single();
    
    if (clientError || !clientProfile || clientProfile.role !== 'user_client') {
      return NextResponse.json({ error: 'Cliente não encontrado ou não autorizado' }, { status: 403 });
    }
    
    // Verifica se a propriedade existe e está disponível
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('available, host_id')
      .eq('id', property_id)
      .single();
    
    if (propertyError || !property || !property.available) {
      return NextResponse.json({ error: 'Propriedade não encontrada ou não disponível' }, { status: 400 });
    }
    
    // Verifica se o cliente não está tentando reservar sua própria propriedade
    if (property.host_id === client_id) {
      return NextResponse.json({ error: 'Você não pode reservar sua própria propriedade' }, { status: 400 });
    }
    
    // Verifica conflito de datas - se já existe reserva aceita para o mesmo período
    const { data: conflictingBookings, error: conflictError } = await supabaseAdmin
      .from('bookings')
      .select('id, start_date, end_date, status')
      .eq('property_id', property_id)
      .eq('status', 'accepted')
      .lte('start_date', end_date)
      .gte('end_date', start_date);
    
    if (conflictError) {
      console.error('Erro ao verificar conflito de datas:', conflictError);
      return NextResponse.json({ error: 'Erro ao verificar disponibilidade' }, { status: 500 });
    }
    
    if (conflictingBookings && conflictingBookings.length > 0) {
      const conflictDates = conflictingBookings.map(b => 
        `${new Date(b.start_date).toLocaleDateString('pt-BR')} até ${new Date(b.end_date).toLocaleDateString('pt-BR')}`
      ).join(', ');
      
      return NextResponse.json({ 
        error: `Propriedade já reservada para o período solicitado. Conflito com: ${conflictDates}` 
      }, { status: 409 });
    }
    
    // Cria a reserva usando admin client (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([{
        property_id,
        client_id,
        start_date,
        end_date,
        total_price,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar reserva:', error);
      return NextResponse.json({ error: 'Erro ao criar reserva: ' + error.message }, { status: 500 });
    }
    
    // Cria notificação para o host
    await supabaseAdmin
      .from('notifications')
      .insert([{
        user_id: property.host_id,
        message: `Nova solicitação de reserva recebida para sua propriedade.`,
        read: false
      }]);
    
    return NextResponse.json({ success: true, booking: data });
    
  } catch (error) {
    console.error('Erro na API de criação de reserva:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
