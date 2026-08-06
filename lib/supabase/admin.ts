import { createClient } from '@supabase/supabase-js';

// SERVER-ONLY. Uses the service-role key, which bypasses RLS entirely -
// never import this from a 'use client' file or a component that could
// end up in the browser bundle. Only call from Route Handlers, and only
// after authorizing the caller yourself (see requireCompanyRole below).
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set - see DEPLOYMENT.md');
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
