// src/app/api/property/cleanup-locations/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Função para limpar o formato de localização
function cleanLocationFormat(fullLocation: string): string {
  if (!fullLocation) return fullLocation;
  
  // Lista de termos desnecessários que aparecem em localizações brasileiras
  const unnecessaryTerms = [
    'Região Geográfica Imediata',
    'Região Metropolitana',
    'Região Geográfica Intermediária',
    'Região Nordeste',
    'Região Norte',
    'Região Centro-Oeste',
    'Região Sudeste',
    'Região Sul',
    'Brasil'
  ];
  
  // Divide a localização por vírgulas
  const parts = fullLocation.split(',').map(part => part.trim());
  
  // Remove partes que contêm termos desnecessários
  const cleanParts = parts.filter(part => {
    return !unnecessaryTerms.some(term => part.includes(term));
  });
  
  // Pega apenas cidade, estado e país (máximo 3 partes)
  const finalParts = cleanParts.slice(0, 3);
  
  return finalParts.join(', ');
}

export async function POST() {
  try {
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

    // Busca todas as propriedades
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('id, location');
    
    if (error) {
      console.error('Erro ao buscar propriedades:', error);
      return NextResponse.json({ error: 'Erro ao buscar propriedades: ' + error.message }, { status: 500 });
    }

    let updatedCount = 0;
    const updates = [];

    // Processa cada propriedade
    for (const property of properties) {
      const cleanedLocation = cleanLocationFormat(property.location);
      
      if (cleanedLocation !== property.location) {
        const { error: updateError } = await supabaseAdmin
          .from('properties')
          .update({ location: cleanedLocation })
          .eq('id', property.id);
        
        if (updateError) {
          console.error(`Erro ao atualizar propriedade ${property.id}:`, updateError);
        } else {
          updatedCount++;
          updates.push({
            id: property.id,
            from: property.location,
            to: cleanedLocation
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${updatedCount} propriedades atualizadas de ${properties.length} total`,
      updates 
    });
    
  } catch (error) {
    console.error('Erro na limpeza de localizações:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
