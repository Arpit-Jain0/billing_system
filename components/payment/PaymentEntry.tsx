'use client';

import React from "react"

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentAccountingYear, getLocalDateString } from '@/lib/invoice-utils';

const initialFormData = {
  vno: '',
  payment_date: getLocalDateString(),
  bank_cash: 'Cash',
  payment_type: 'Payment',
  cheque_no: '',
  cheque_date: '',
  party_id: '',
  amount: '',
  remark: '',
};

export function PaymentEntry({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.schema('saree').from('payments').insert([
        {
          ...formData,
          party_id: parseInt(formData.party_id),
          amount: parseFloat(formData.amount),
          cheque_date: formData.bank_cash === 'Cheque' && formData.cheque_date ? formData.cheque_date : null,
          accounting_year: getCurrentAccountingYear(),
        },
      ]);

      if (error) throw error;

      alert('Payment recorded successfully');
      onSuccess?.();
      setFormData(initialFormData);
    } catch (error) {
      console.error('[v0] Error recording payment:', error);
      alert('Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Entry</CardTitle>
        <CardDescription>Record payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vno">VNo.</Label>
              <Input id="vno" name="vno" value={formData.vno} onChange={handleChange} placeholder="VNo." />
            </div>
            <div>
              <Label htmlFor="payment_date">Payment Date</Label>
              <Input
                id="payment_date"
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="bank_cash">Bank/Cash</Label>
              <Select value={formData.bank_cash} onValueChange={(value) => handleSelectChange('bank_cash', value)}>
                <SelectTrigger id="bank_cash">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment_type">Payment Type</Label>
              <Select value={formData.payment_type} onValueChange={(value) => handleSelectChange('payment_type', value)}>
                <SelectTrigger id="payment_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Payment">Payment</SelectItem>
                  <SelectItem value="Receipt">Receipt</SelectItem>
                  <SelectItem value="Advance">Advance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="party_id">Party ID</Label>
              <Input
                id="party_id"
                type="number"
                name="party_id"
                value={formData.party_id}
                onChange={handleChange}
                placeholder="Party ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
                required
              />
            </div>
            {formData.bank_cash === 'Cheque' && (
              <>
                <div>
                  <Label htmlFor="cheque_no">Cheque No.</Label>
                  <Input id="cheque_no" name="cheque_no" value={formData.cheque_no} onChange={handleChange} placeholder="Cheque No." />
                </div>
                <div>
                  <Label htmlFor="cheque_date">Cheque Date</Label>
                  <Input id="cheque_date" type="date" name="cheque_date" value={formData.cheque_date} onChange={handleChange} />
                </div>
              </>
            )}
          </div>
          <div>
            <Label htmlFor="remark">Remark</Label>
            <Textarea id="remark" name="remark" value={formData.remark} onChange={handleChange} placeholder="Remark" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
