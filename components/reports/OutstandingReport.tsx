'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/invoice-utils';

interface Row {
  partyId: number;
  partyName: string;
  billed: number;
  paid: number;
}

export function OutstandingReport({
  companyId,
  type,
  onOpenChange,
}: {
  companyId: number;
  type: 'sales' | 'purchase' | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type) return;
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      const invoiceTable = type === 'sales' ? 'sales_invoices' : 'purchase_invoices';
      const amountField = type === 'sales' ? 'net_amount' : 'total_amount';

      const [{ data: invoices, error: invError }, { data: parties, error: partyError }, { data: payments, error: payError }] =
        await Promise.all([
          supabase.schema('saree').from(invoiceTable).select(`party_id, ${amountField}`).eq('company_id', companyId),
          supabase.schema('saree').from('parties').select('id, name').eq('company_id', companyId),
          supabase.schema('saree').from('payments').select('party_id, amount').eq('company_id', companyId),
        ]);

      if (cancelled) return;
      if (invError || partyError || payError) {
        console.error('[v0] Error loading outstanding report:', invError || partyError || payError);
        setRows([]);
        setLoading(false);
        return;
      }

      const partyNames = new Map<number, string>((parties || []).map((p: any) => [p.id, p.name]));

      const billedByParty = new Map<number, number>();
      (invoices || []).forEach((inv: any) => {
        if (inv.party_id == null) return;
        billedByParty.set(inv.party_id, (billedByParty.get(inv.party_id) || 0) + (inv[amountField] || 0));
      });

      const paidByParty = new Map<number, number>();
      (payments || []).forEach((p: any) => {
        if (p.party_id == null) return;
        paidByParty.set(p.party_id, (paidByParty.get(p.party_id) || 0) + (p.amount || 0));
      });

      const result: Row[] = Array.from(billedByParty.entries()).map(([partyId, billed]) => ({
        partyId,
        partyName: partyNames.get(partyId) || `Party #${partyId}`,
        billed,
        paid: paidByParty.get(partyId) || 0,
      }));
      result.sort((a, b) => b.billed - b.paid - (a.billed - a.paid));

      setRows(result);
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [type, companyId]);

  const title = type === 'sales' ? 'Sales Outstanding' : 'Purchase Outstanding';
  const partyLabel = type === 'sales' ? 'Customer' : 'Supplier';

  return (
    <Dialog open={type !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-slate-500 text-sm">No outstanding balances.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-2 font-medium text-slate-600">{partyLabel}</th>
                  <th className="text-right p-2 font-medium text-slate-600">Total Billed</th>
                  <th className="text-right p-2 font-medium text-slate-600">Total Paid</th>
                  <th className="text-right p-2 font-medium text-slate-600">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.partyId} className="border-b border-slate-100">
                    <td className="p-2">{row.partyName}</td>
                    <td className="p-2 text-right">{formatCurrency(row.billed)}</td>
                    <td className="p-2 text-right">{formatCurrency(row.paid)}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(row.billed - row.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
