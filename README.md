# API Key Management System

A modern API key management system built with Next.js and Supabase, featuring secure key generation, usage tracking, and role-based access control.

## 🔧 Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Supabase account and project
- Git

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Create a new Supabase project from the [Supabase Dashboard](https://app.supabase.com)

2. Get your project credentials:
   - Go to Project Settings > API
   - Copy the Project URL and anon/public key
   - Add them to your `.env.local` file

3. Set up the database:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase-setup.sql`
   - Run the SQL script

The SQL script will create:
- The `api_keys` table with proper types and constraints
- Indexes for optimized queries
- Row Level Security (RLS) policies for secure access
- Proper documentation for all columns

### Database Schema

```sql
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  type TEXT DEFAULT 'development' NOT NULL,
  usage INTEGER DEFAULT 0 NOT NULL,
  usage_limit INTEGER DEFAULT NULL
);
```

### Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own API keys
   - Policies are enforced at the database level
   - Automatic user_id validation through Supabase Auth

2. **API Key Security**
   - Keys are masked by default
   - Full key is only shown once upon creation
   - Temporary unmasking with auto-hide after 30 seconds

### API Endpoints

```typescript
// List all API keys
GET /api/apikeys

// Create new API key
POST /api/apikeys
Body: { name: string, type?: 'development' | 'production', usageLimit?: number }

// Get single API key
GET /api/apikeys/[id]
Query: ?showFull=true (optional, to show unmasked key)

// Update API key
PUT /api/apikeys/[id]
Body: { name: string }

// Delete API key
DELETE /api/apikeys/[id]

// Import existing API key
POST /api/apikeys/import
Body: { name: string, key: string, type?: 'development' | 'production' }
```

## 🔒 Authentication

The system uses Supabase Authentication. Each API key is associated with a user through their UUID. The Row Level Security policies ensure users can only:

- View their own API keys
- Create keys for themselves
- Update their own keys
- Delete their own keys


## 🛠️ Development

### Type Safety

TypeScript interfaces for the database schema are in `src/lib/types.ts`:

```typescript
export interface ApiKey {
  id: string;      // UUID
  name: string;
  key: string;
  created_at: string;
  last_used?: string | null;
  user_id: string; // UUID
  type: 'production' | 'development';
  usage: number;
  usage_limit: number | null;
}
```

### Database Functions

All database operations are abstracted in `src/lib/db/index.ts` using the Supabase client.

## 🚨 Error Handling

The system includes:
- Input validation
- Error boundaries
- Proper error messages
- Loading states
- Retry logic for failed API calls

## 📝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
