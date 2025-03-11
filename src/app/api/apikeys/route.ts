import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getApiKeys, createApiKey } from '@/lib/db';

// GET /api/apikeys - List all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apiKeys = await getApiKeys(user.id);
    
    // Mask the API keys for security
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      key: `${key.key.substring(0, 4)}...${key.key.substring(key.key.length - 4)}`
    }));
    
    return NextResponse.json(maskedKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// Helper function to mask API keys
function maskApiKey(key: string): string {
  const parts = key.split('_');
  if (parts.length > 1) {
    return `${parts[0]}_${parts[1].substring(0, 8)}...${parts[1].slice(-4)}`;
  }
  return `${key.substring(0, 8)}...${key.slice(-4)}`;
}

// POST /api/apikeys - Create a new API key
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

    const { name, type = 'development', usageLimit = null } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    const newKey = await createApiKey(name.trim(), user.id, type, usageLimit);
    
    if (!newKey) {
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      );
    }
    
    // Return the key with masked value
    return NextResponse.json({
      ...newKey,
      key: maskApiKey(newKey.key)
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
} 