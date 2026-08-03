'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/invoice-utils';
import { RecordDetailsDialog } from './RecordDetailsDialog';

export function PurchaseList() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase.schema('saree').from('purchase_invoices').select('*').order('bill_date', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('[v0] Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-slate-500 text-center">Loading purchase invoices...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Invoices</CardTitle>
        <CardDescription>{purchases.length} invoices found</CardDescription>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No purchase invoices yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-medium text-slate-600">Bill No</th>
                  <th className="text-left p-3 font-medium text-slate-600">Date</th>
                  <th className="text-left p-3 font-medium text-slate-600">Supplier ID</th>
                  <th className="text-right p-3 font-medium text-slate-600">Amount</th>
                  <th className="text-left p-3 font-medium text-slate-600">GST Type</th>
                  <th className="text-center p-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium">{invoice.bill_no}</td>
                    <td className="p-3 text-slate-600">{formatDate(invoice.bill_date)}</td>
                    <td className="p-3 text-slate-600">{invoice.party_id}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(invoice.total_amount || 0)}</td>
                    <td className="p-3 text-slate-600">{invoice.gst_type}</td>
                    <td className="p-3 text-center">
                      <Button variant="outline" size="sm" onClick={() => setSelected(invoice)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      <RecordDetailsDialog
        title="Purchase Invoice Details"
        record={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </Card>
  );
}
