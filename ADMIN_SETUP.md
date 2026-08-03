# Admin Account Setup Guide

## Quick Start - Create Admin Account

### Step 1: Create Users Table (if not already created)

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS saree.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON saree.users(email);
ALTER TABLE saree.users ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Admin Account

Run this SQL in your Supabase SQL Editor to create the admin account:

```sql
INSERT INTO saree.users (email, password_hash, full_name, phone, role, is_active) 
VALUES (
  'mps',
  'mps@1234',
  'Admin User',
  '0000000000',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = 'mps@1234',
    role = 'admin',
    is_active = true;
```

### Step 3: Login to Application

1. Go to the login page: `http://localhost:3000/login`
2. Enter credentials:
   - **Email**: `mps`
   - **Password**: `mps@1234`
3. Click "Sign In"
4. You'll be redirected to the dashboard at `/protected`

## Login System Details

The application uses a custom authentication system that:
- Queries the `saree.users` table directly
- Stores user session in browser localStorage
- Checks authentication on page refresh
- Redirects unauthenticated users to login page

## Session Management

- User session persists in localStorage
- Session is cleared when logging out
- Page refresh checks session automatically
- Protected routes redirect to login if not authenticated

## User Roles

- **admin**: Full access to all features
- **staff**: Limited access to sales and basic operations
- **viewer**: Read-only access to reports

## Adding More Users

To add additional users, insert into the `saree.users` table:

```sql
INSERT INTO saree.users (email, password_hash, full_name, phone, role, is_active) 
VALUES (
  'staff@example.com',
  'staffpassword123',
  'Staff Member',
  '9876543210',
  'staff',
  true
);
```

## Troubleshooting

### Login fails with "Invalid email or password"
- Check email is exactly as stored in database (case-sensitive)
- Verify password matches exactly
- Check user is marked `is_active = true`

### Session not persisting on refresh
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check browser console for errors

### Redirects to login on every page load
- Ensure Supabase credentials are correct in `.env`
- Verify `saree.users` table exists and has data
- Check network tab in browser DevTools for API errors
