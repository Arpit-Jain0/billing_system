import { NextResponse } from 'next/server';
import { requireCompanyRole, routeErrorResponse } from '@/lib/supabase/route';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_ROLES = ['owner', 'admin', 'staff', 'viewer'];

async function countOwners(admin: ReturnType<typeof createAdminClient>, companyId: number) {
  const { count } = await admin
    .schema('saree')
    .from('user_companies')
    .select('user_id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('role', 'owner');
  return count || 0;
}

export async function PATCH(request: Request) {
  try {
    const { companyId } = await requireCompanyRole(['owner', 'admin']);
    const { user_id, role } = await request.json();

    if (!user_id || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const admin = createAdminClient();

    if (role !== 'owner') {
      const { data: current } = await admin
        .schema('saree')
        .from('user_companies')
        .select('role')
        .eq('user_id', user_id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (current?.role === 'owner' && (await countOwners(admin, companyId)) <= 1) {
        return NextResponse.json(
          { error: 'This shop needs at least one owner - promote someone else first.' },
          { status: 400 }
        );
      }
    }

    const { error } = await admin
      .schema('saree')
      .from('user_companies')
      .update({ role })
      .eq('user_id', user_id)
      .eq('company_id', companyId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { companyId } = await requireCompanyRole(['owner', 'admin']);
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: current } = await admin
      .schema('saree')
      .from('user_companies')
      .select('role')
      .eq('user_id', user_id)
      .eq('company_id', companyId)
      .maybeSingle();

    if (current?.role === 'owner' && (await countOwners(admin, companyId)) <= 1) {
      return NextResponse.json(
        { error: 'This shop needs at least one owner - promote someone else before removing them.' },
        { status: 400 }
      );
    }

    const { error } = await admin
      .schema('saree')
      .from('user_companies')
      .delete()
      .eq('user_id', user_id)
      .eq('company_id', companyId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
