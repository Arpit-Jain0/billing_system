'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';

type Role = 'owner' | 'admin' | 'staff' | 'viewer';

interface Membership {
  companyId: number;
  companyName: string;
  role: Role;
}

interface CompanyContextType {
  loading: boolean;
  // True once the tenant cookies have been read client-side - false
  // only for the brief instant right after mount, before any cookie
  // has been checked at all.
  tenantResolved: boolean;
  // The shop resolved from the subdomain (proxy.ts), regardless of
  // whether the signed-in user is actually a member of it.
  tenantSlug: string | null;
  tenantName: string | null;
  // Only set once we've confirmed the signed-in user belongs to the
  // resolved shop - this is what the rest of the app should scope
  // every query to.
  companyId: number | null;
  role: Role | null;
  // True once loading is done and the user does NOT belong to the
  // shop resolved from the subdomain.
  accessDenied: boolean;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthContext();
  const [tenant, setTenant] = useState<{ id: string | null; slug: string | null; name: string | null }>({
    id: null,
    slug: null,
    name: null,
  });
  // Cookies can only be read after mount (server has no `document`), so
  // this starts false and flips once - deferring to the client instead
  // of rendering a different value on the server vs. the first client
  // pass, which would otherwise be a hydration mismatch.
  const [tenantResolved, setTenantResolved] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    setTenant({
      id: readCookie('tenant_id'),
      slug: readCookie('tenant_slug'),
      name: readCookie('tenant_name'),
    });
    setTenantResolved(true);
  }, []);

  useEffect(() => {
    if (!tenantResolved || authLoading) return;

    if (!user || !tenant.id) {
      setMembershipLoading(false);
      return;
    }

    let cancelled = false;
    setMembershipLoading(true);

    supabase
      .schema('saree')
      .from('user_companies')
      .select('company_id, role, companies(name)')
      .eq('user_id', user.id)
      .eq('company_id', parseInt(tenant.id))
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          setMembership({
            companyId: data.company_id,
            companyName: (data as any).companies?.name ?? tenant.name ?? '',
            role: data.role as Role,
          });
          setAccessDenied(false);
        } else {
          setMembership(null);
          setAccessDenied(true);
        }
        setMembershipLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, tenantResolved, tenant.id, tenant.name]);

  return (
    <CompanyContext.Provider
      value={{
        loading: !tenantResolved || authLoading || membershipLoading,
        tenantResolved,
        tenantSlug: tenant.slug,
        tenantName: tenant.name,
        companyId: membership?.companyId ?? null,
        role: membership?.role ?? null,
        accessDenied,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
}
