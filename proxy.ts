import { type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

// Resolves which shop a request is for from its subdomain
// (shopa.yourdomain.com -> slug "shopa") and stamps it on cookies the
// rest of the app reads via useCompany(). This is a convenience/UX
// filter only - saree.user_companies + RLS is what actually enforces
// isolation, so it's fine for these cookies to be plain (non-httpOnly)
// and readable by client components.
function resolveTenantSlug(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');

  // Local dev: shopa.localhost:3000
  if (hostname.endsWith('.localhost')) {
    return parts[0];
  }

  // Vercel preview deployments (*.vercel.app) have no room for a shop
  // subdomain of their own, so there's nothing to resolve there.
  if (hostname.endsWith('.vercel.app')) {
    return null;
  }

  // Production: shopa.yourdomain.com -> 3+ labels, first one is the shop.
  // Bare yourdomain.com or www.yourdomain.com -> no shop selected.
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // Touching auth here refreshes an expiring session cookie before it
  // reaches a Server/Client Component - required by @supabase/ssr.
  await supabase.auth.getUser();

  let slug = resolveTenantSlug(request);
  const isLocalOrPreview =
    request.headers.get('host')?.split(':')[0] === 'localhost' ||
    request.headers.get('host')?.includes('.vercel.app');

  if (!slug && isLocalOrPreview) {
    // Dev/preview convenience: no subdomain to read, so fall back to
    // whichever shop was created first instead of forcing every local
    // request onto a subdomain.
    const { data } = await supabase.schema('saree').from('companies').select('slug').order('id').limit(1).maybeSingle();
    slug = data?.slug ?? null;
  }

  if (slug) {
    const { data: company } = await supabase
      .schema('saree')
      .from('companies')
      .select('id, slug, name, accounting_year')
      .eq('slug', slug)
      .maybeSingle();

    if (company) {
      response.cookies.set('tenant_id', String(company.id), { path: '/' });
      response.cookies.set('tenant_slug', company.slug, { path: '/' });
      response.cookies.set('tenant_name', company.name, { path: '/' });
    } else {
      response.cookies.delete('tenant_id');
      response.cookies.delete('tenant_slug');
      response.cookies.delete('tenant_name');
    }
  } else {
    response.cookies.delete('tenant_id');
    response.cookies.delete('tenant_slug');
    response.cookies.delete('tenant_name');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
