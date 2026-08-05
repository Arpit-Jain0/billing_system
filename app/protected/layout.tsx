'use client';

import React from "react"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuthContext();
  const { loading: companyLoading, tenantSlug, tenantName, companyId, accessDenied } = useCompany();

  const loading = authLoading || companyLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!tenantSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Shop not found</h1>
          <p className="text-slate-600 mb-6">This address isn't linked to a shop yet.</p>
          <Button variant="outline" onClick={() => signOut().then(() => router.push('/login'))}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (accessDenied || !companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">No access to {tenantName || 'this shop'}</h1>
          <p className="text-slate-600 mb-6">
            Your account isn't a member of this shop. Ask an admin to add you, or sign in with a different account.
          </p>
          <Button variant="outline" onClick={() => signOut().then(() => router.push('/login'))}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
