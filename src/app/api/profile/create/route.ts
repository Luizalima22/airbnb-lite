import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, role, name } = await request.json();

    if (!userId || !email || !role || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, try using the database function (security definer)
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: profileData, error: functionError } = await supabaseClient
      .rpc('create_profile_signup', {
        user_id: userId,
        user_email: email,
        user_name: name,
        user_role: role,
      });

    if (functionError) {
      // If function failed, try service role if available
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseService = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: profile, error: profileError } = await supabaseService
          .from('profiles')
          .insert({
            id: userId,
            email,
            role,
            name,
            avatar_url: '',
          })
          .select()
          .single();

        if (profileError) {
          // If profile already exists, try to fetch it
          if (profileError.code === '23505') {
            const { data: existingProfile, error: fetchError } = await supabaseService
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (fetchError) {
              return NextResponse.json(
                { error: 'Profile already exists but could not be retrieved' },
                { status: 500 }
              );
            }
            
            return NextResponse.json({ profile: existingProfile });
          }
          
          return NextResponse.json(
            { error: profileError.message || 'Failed to create profile' },
            { status: 500 }
          );
        }

        return NextResponse.json({ profile });
      }
      
      return NextResponse.json(
        { error: functionError.message || 'Failed to create profile' },
        { status: 500 }
      );
    }

    // Function succeeded, return the profile
    if (profileData && profileData.length > 0) {
      return NextResponse.json({ profile: profileData[0] });
    }

    return NextResponse.json(
      { error: 'Profile creation succeeded but no data returned' },
      { status: 500 }
    );
    
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
