-- Create users table in saree schema
CREATE TABLE saree.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'staff', -- 'admin', 'staff', 'viewer'
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON saree.users(email);

-- Enable RLS
ALTER TABLE saree.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view only their own record
CREATE POLICY "Users can view their own record"
  ON saree.users FOR SELECT
  USING (auth.uid() = id OR current_setting('app.is_admin')::boolean = true);

-- Allow users to update only their own record
CREATE POLICY "Users can update their own record"
  ON saree.users FOR UPDATE
  USING (auth.uid() = id OR current_setting('app.is_admin')::boolean = true);

-- Only admins can insert new users
CREATE POLICY "Only admins can insert users"
  ON saree.users FOR INSERT
  WITH CHECK (current_setting('app.is_admin')::boolean = true);

-- Only admins can delete users
CREATE POLICY "Only admins can delete users"
  ON saree.users FOR DELETE
  USING (current_setting('app.is_admin')::boolean = true);
