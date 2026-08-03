'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'staff' | 'viewer';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('[v0] Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Query the users table for the user
      const { data, error } = await supabase
        .schema('saree')
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Bcrypt hashes are verified properly; plain-text password_hash values
      // (as created by ADMIN_SETUP.md) fall back to a direct comparison.
      const isBcryptHash = data.password_hash.startsWith('$2a$') || data.password_hash.startsWith('$2b$');
      const passwordMatches = isBcryptHash
        ? bcrypt.compareSync(password, data.password_hash)
        : data.password_hash === password;

      if (!passwordMatches) {
        return { error: { message: 'Invalid email or password' } };
      }

      const user: AuthUser = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      };

      // Store user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));
      setUser(user);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Login failed' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
