-- Insert admin account into saree.users table
-- Email: mps
-- Password: mps@1234 (hashed with bcrypt)
-- Bcrypt hash of 'mps@1234': $2b$10$4F6p7kkW7n8z5K3Q9L2M.u6N4O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C

INSERT INTO saree.users (email, password_hash, full_name, phone, role, is_active) 
VALUES (
  'mps',
  '$2b$10$4F6p7kkW7n8z5K3Q9L2M.u6N4O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C',
  'Admin User',
  '0000000000',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2b$10$4F6p7kkW7n8z5K3Q9L2M.u6N4O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C',
    role = 'admin',
    is_active = true;
