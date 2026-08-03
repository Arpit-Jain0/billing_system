import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .schema('saree')
        .from('sales_invoices')
        .select(
          `
          *,
          sales_invoice_items(
            id,
            quantity,
            unit_price,
            amount,
            discount,
            add_amount,
            gst_amount,
            product:product_id(
              barcode,
              item_name,
              unit
            )
          )
        `
        )
        .eq('id', parseInt(id))
        .single();

      if (error) throw error;
      return Response.json(data);
    }

    const { data, error } = await supabase.schema('saree').from('sales_invoices').select('*').order('bill_date', { ascending: false });

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error('[v0] Error fetching sales:', error);
    return Response.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase.schema('saree').from('sales_invoices').insert([body]).select();

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error('[v0] Error creating sales invoice:', error);
    return Response.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase.schema('saree').from('sales_invoices').update(updateData).eq('id', id).select();

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error('[v0] Error updating sales invoice:', error);
    return Response.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
