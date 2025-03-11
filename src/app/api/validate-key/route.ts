import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabaseAdmin = createAdminClient();

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Check if the API key exists in the database
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id')
      .eq('key', apiKey.trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // If we get here, the API key is valid
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      { error: 'Failed to validate API key' },
      { status: 500 }
    );
  }
} 