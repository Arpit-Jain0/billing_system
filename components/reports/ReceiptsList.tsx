'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/invoice-utils';
import { RecordDetailsDialog } from './RecordDetailsDialog';

export function ReceiptsList() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase.schema('saree').from('payments').select('*').order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('[v0] Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-slate-500 text-center">Loading payment records...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Records</CardTitle>
        <CardDescription>{payments.length} transactions found</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No payment records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-medium text-slate-600">VNo</th>
                  <th className="text-left p-3 font-medium text-slate-600">Date</th>
                  <th className="text-left p-3 font-medium text-slate-600">Party ID</th>
                  <th className="text-left p-3 font-medium text-slate-600">Bank/Cash</th>
                  <th className="text-right p-3 font-medium text-slate-600">Amount</th>
                  <th className="text-center p-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium">{payment.vno}</td>
                    <td className="p-3 text-slate-600">{formatDate(payment.payment_date)}</td>
                    <td className="p-3 text-slate-600">{payment.party_id}</td>
                    <td className="p-3 text-slate-600">{payment.bank_cash}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(payment.amount || 0)}</td>
                    <td className="p-3 text-center">
                      <Button variant="outline" size="sm" onClick={() => setSelected(payment)}>
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
        title="Payment Details"
        record={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </Card>
  );
}
