import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// For Route Handlers: a session-aware client that respects RLS as the
// signed-in caller, used to figure out who's asking before any
// service-role (RLS-bypassing) work happens.
export async function createRouteClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}

export class RouteAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Confirms the caller is signed in and holds one of `roles` in the shop
// resolved from the tenant cookie (proxy.ts). Throws RouteAuthError
// otherwise - callers should catch it and return the matching response.
export async function requireCompanyRole(roles: Array<'owner' | 'admin' | 'staff' | 'viewer'>) {
  const cookieStore = await cookies();
  const supabase = await createRouteClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new RouteAuthError(401, 'Not signed in');

  const tenantId = cookieStore.get('tenant_id')?.value;
  if (!tenantId) throw new RouteAuthError(400, 'No shop resolved for this request');

  const companyId = parseInt(tenantId);
  const { data: membership } = await supabase
    .schema('saree')
    .from('user_companies')
    .select('role')
    .eq('user_id', user.id)
    .eq('company_id', companyId)
    .maybeSingle();

  if (!membership || !roles.includes(membership.role as any)) {
    throw new RouteAuthError(403, 'Not allowed');
  }

  return { supabase, user, companyId, role: membership.role as 'owner' | 'admin' | 'staff' | 'viewer' };
}

export function routeErrorResponse(error: unknown) {
  if (error instanceof RouteAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('[v0] Route error:', error);
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
}
