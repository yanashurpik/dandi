import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { importApiKey } from '@/lib/db';

// POST /api/apikeys/import - Import an existing API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, key, type = 'development' } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!key || typeof key !== 'string' || key.trim() === '') {
      return NextResponse.json(
        { error: 'API key is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (type !== 'development' && type !== 'production') {
      return NextResponse.json(
        { error: 'Type must be either "development" or "production"' },
        { status: 400 }
      );
    }
    
    const importedKey = await importApiKey(name.trim(), key.trim(), user.id, type);
    
    if (!importedKey) {
      return NextResponse.json(
        { error: 'Failed to import API key' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(importedKey, { status: 201 });
  } catch (error) {
    console.error('Error importing API key:', error);
    const message = error instanceof Error ? error.message : 'Failed to import API key';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 