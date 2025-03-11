import { v4 as uuidv4 } from 'uuid';
import { createAdminClient } from '../supabase/admin';
import { ApiKey, ApiKeyInsert, ApiKeyUpdate } from '../types';

// Get the Supabase admin client for database operations
const supabaseAdmin = createAdminClient();

// This is a simple file-based database implementation
// In a real application, you would use a proper database like MongoDB, PostgreSQL, etc.

// Read all API keys for a specific user
export async function getApiKeys(userId: string): Promise<ApiKey[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getApiKeys:', error);
    return [];
  }
}

// Get a single API key by ID
export async function getApiKeyById(id: string, userId: string): Promise<ApiKey | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching API key by ID:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getApiKeyById:', error);
    throw error;
  }
}

// Create a new API key
export async function createApiKey(
  name: string, 
  userId: string, 
  type: 'production' | 'development' = 'development',
  usageLimit: number | null = null
): Promise<ApiKey | null> {
  try {
    // Generate a secure API key in the format shown previously (tvly_*)
    const apiKey = `dandi_${Buffer.from(uuidv4()).toString('base64').replace(/[+/=]/g, '')}`;
    
    const newKey: ApiKeyInsert = {
      name: name.trim(),
      key: apiKey,
      user_id: userId,
      type,
      usage: 0,
      usage_limit: usageLimit,
      last_used: null,
    };
    
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert(newKey)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating API key:', error);
      if (error.code === '23503') {
        throw new Error('Invalid user ID');
      } else if (error.code === '23505') {
        throw new Error('API key already exists');
      }
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from database');
    }
    
    return data;
  } catch (error) {
    console.error('Error in createApiKey:', error);
    throw error;
  }
}

// Import an existing API key
export async function importApiKey(
  name: string, 
  keyValue: string, 
  userId: string, 
  type: 'production' | 'development' = 'development'
): Promise<ApiKey | null> {
  try {
    // Check if the key already exists
    const { data: existingKey, error: checkError } = await supabaseAdmin
      .from('api_keys')
      .select('id')
      .eq('key', keyValue)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing key:', checkError);
      throw checkError;
    }
    
    if (existingKey) {
      throw new Error('API key already exists');
    }
    
    const newKey: ApiKeyInsert = {
      name: name.trim(),
      key: keyValue,
      user_id: userId,
      type,
      usage: 0,
      usage_limit: null,
      last_used: null,
    };
    
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert(newKey)
      .select()
      .single();
    
    if (error) {
      console.error('Error importing API key:', error);
      if (error.code === '23503') {
        throw new Error('Invalid user ID');
      } else if (error.code === '23505') {
        throw new Error('API key already exists');
      }
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from database');
    }
    
    return data;
  } catch (error) {
    console.error('Error in importApiKey:', error);
    throw error;
  }
}

// Update an API key
export async function updateApiKey(
  id: string, 
  name: string, 
  userId: string
): Promise<ApiKey | null> {
  try {
    const updates: ApiKeyUpdate = { name };
    
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateApiKey:', error);
    throw error;
  }
}

// Delete an API key
export async function deleteApiKey(id: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteApiKey:', error);
    throw error;
  }
}

// Record API key usage
export async function recordApiKeyUsage(key: string): Promise<void> {
  try {
    const { data: apiKey, error: fetchError } = await supabaseAdmin
      .from('api_keys')
      .select('id, usage')
      .eq('key', key)
      .single();
    
    if (fetchError || !apiKey) {
      console.error('API key not found for usage record:', fetchError);
      throw new Error('API key not found');
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('api_keys')
      .update({
        usage: apiKey.usage + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', apiKey.id);
    
    if (updateError) {
      console.error('Error updating API key usage:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error in recordApiKeyUsage:', error);
    throw error;
  }
} 