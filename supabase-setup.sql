-- Create API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  type TEXT DEFAULT 'development' NOT NULL CHECK (type IN ('development', 'production')),
  usage INTEGER DEFAULT 0 NOT NULL,
  usage_limit INTEGER DEFAULT NULL
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys (user_id);

-- Create index for faster lookups by key
CREATE INDEX IF NOT EXISTS api_keys_key_idx ON public.api_keys (key);

-- Row Level Security - Only allow users to access their own API keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own API keys
CREATE POLICY select_own_api_keys ON public.api_keys 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid()::UUID);

-- Policy to allow users to insert their own API keys
CREATE POLICY insert_own_api_keys ON public.api_keys 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid()::UUID);

-- Policy to allow users to update their own API keys
CREATE POLICY update_own_api_keys ON public.api_keys 
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid()::UUID);

-- Policy to allow users to delete their own API keys
CREATE POLICY delete_own_api_keys ON public.api_keys 
  FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid()::UUID);

-- Comment on table and columns for better documentation
COMMENT ON TABLE public.api_keys IS 'Stores API keys for users to access the API';
COMMENT ON COLUMN public.api_keys.id IS 'Unique identifier for the API key';
COMMENT ON COLUMN public.api_keys.name IS 'User-defined name for the API key';
COMMENT ON COLUMN public.api_keys.key IS 'The actual API key value used for authentication';
COMMENT ON COLUMN public.api_keys.created_at IS 'When the API key was created';
COMMENT ON COLUMN public.api_keys.last_used IS 'When the API key was last used';
COMMENT ON COLUMN public.api_keys.user_id IS 'The UUID of the user who owns this API key';
COMMENT ON COLUMN public.api_keys.type IS 'Type of API key (development or production)';
COMMENT ON COLUMN public.api_keys.usage IS 'Current usage count for the API key';
COMMENT ON COLUMN public.api_keys.usage_limit IS 'Optional usage limit for the API key'; 