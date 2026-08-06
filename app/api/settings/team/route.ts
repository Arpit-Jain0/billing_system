import { NextResponse } from 'next/server';
import { requireCompanyRole, routeErrorResponse } from '@/lib/supabase/route';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_ROLES = ['owner', 'admin', 'staff', 'viewer'];

export async function GET() {
  try {
    const { companyId } = await requireCompanyRole(['owner', 'admin']);
    const admin = createAdminClient();

    const { data: memberships, error } = await admin
      .schema('saree')
      .from('user_companies')
      .select('user_id, role, created_at')
      .eq('company_id', companyId)
      .order('created_at');

    if (error) throw error;

    const members = await Promise.all(
      (memberships || []).map(async (m: any) => {
        const { data } = await admin.auth.admin.getUserById(m.user_id);
        return {
          userId: m.user_id,
          email: data?.user?.email || 'Unknown',
          role: m.role,
          joinedAt: m.created_at,
        };
      })
    );

    return NextResponse.json({ members });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await requireCompanyRole(['owner', 'admin']);
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const role = body.role;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const admin = createAdminClient();
    const origin = request.headers.get('origin') || undefined;

    let invitedUserId: string | null = null;

    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: origin ? `${origin}/login` : undefined,
    });

    if (inviteData?.user) {
      invitedUserId = inviteData.user.id;
    } else {
      // Most likely cause: this email already has an account (e.g.
      // they already have access to a different shop). Look them up
      // and just grant access to this shop instead of failing.
      const { data: existing } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const match = existing?.users.find((u) => u.email?.toLowerCase() === email);
      if (match) {
        invitedUserId = match.id;
      } else {
        return NextResponse.json({ error: inviteError?.message || 'Could not invite this email' }, { status: 400 });
      }
    }

    const { error: linkError } = await admin
      .schema('saree')
      .from('user_companies')
      .upsert({ user_id: invitedUserId, company_id: companyId, role }, { onConflict: 'user_id,company_id' });

    if (linkError) throw linkError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
