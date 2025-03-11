export interface ApiKey {
  id: string;  // UUID
  name: string;
  key: string;
  created_at: string;
  last_used?: string | null;
  user_id: string;  // UUID
  type: 'production' | 'development';
  usage: number;
  usage_limit: number | null;
}

export type ApiKeyInsert = Omit<ApiKey, 'id' | 'created_at'>;
export type ApiKeyUpdate = Partial<Omit<ApiKey, 'id' | 'created_at' | 'key'>>;

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: ApiKey;
        Insert: ApiKeyInsert;
        Update: ApiKeyUpdate;
      };
    };
  };
} 