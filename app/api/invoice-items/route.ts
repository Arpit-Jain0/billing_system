import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// This route is only meant to add/remove invoice line items - never arbitrary
// tables (e.g. `users`), which is what an unrestricted `table` param allows.
const ALLOWED_TABLES = new Set(['sales_invoice_items', 'purchase_invoice_items']);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { table, data } = body;

    if (!ALLOWED_TABLES.has(table)) {
      return Response.json({ error: 'Invalid table' }, { status: 400 });
    }

    const { data: result, error } = await supabase.schema('saree').from(table).insert([data]).select();

    if (error) throw error;
    return Response.json(result);
  } catch (error) {
    console.error('[v0] Error adding invoice item:', error);
    return Response.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const id = searchParams.get('id');

    if (!table || !id || !ALLOWED_TABLES.has(table)) {
      return Response.json({ error: 'Missing or invalid table/id' }, { status: 400 });
    }

    const { error } = await supabase.schema('saree').from(table).delete().eq('id', parseInt(id));

    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting item:', error);
    return Response.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
