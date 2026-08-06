import { NextResponse } from 'next/server';
import { requireCompanyRole, routeErrorResponse } from '@/lib/supabase/route';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request) {
  try {
    const { companyId } = await requireCompanyRole(['owner', 'admin']);
    const { name, accounting_year } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Shop name is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .schema('saree')
      .from('companies')
      .update({ name: name.trim(), accounting_year: accounting_year || null })
      .eq('id', companyId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
