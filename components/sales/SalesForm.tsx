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
  bill_no: '',
  bill_date: getLocalDateString(),
  party_id: '',
  book: '',
  bill_type: 'Inc. Excl.',
  broker: '',
  payment_method: 'Cash',
  gross_amount: '0',
  total_discount: '0',
  total_add_amount: '0',
  cgst_percent: '9',
  sgst_percent: '9',
  igst_percent: '18',
  transport: '',
  city: '',
  lr_date: '',
  lr_no: '',
  remark: '',
};

export function SalesForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateGst = () => {
    const gross = parseFloat(formData.gross_amount) || 0;
    const discount = parseFloat(formData.total_discount) || 0;
    const addAmount = parseFloat(formData.total_add_amount) || 0;
    const gstPercent =
      formData.bill_type === 'Inc. Excl.'
        ? (parseFloat(formData.cgst_percent) || 0) + (parseFloat(formData.sgst_percent) || 0)
        : parseFloat(formData.igst_percent) || 0;

    return ((gross - discount + addAmount) * gstPercent) / 100;
  };

  const calculateNetAmount = () => {
    const gross = parseFloat(formData.gross_amount) || 0;
    const discount = parseFloat(formData.total_discount) || 0;
    const addAmount = parseFloat(formData.total_add_amount) || 0;
    return gross - discount + addAmount + calculateGst();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .schema('saree')
        .from('sales_invoices')
        .insert([
          {
            ...formData,
            party_id: parseInt(formData.party_id),
            cgst_percent: parseFloat(formData.cgst_percent),
            sgst_percent: parseFloat(formData.sgst_percent),
            igst_percent: parseFloat(formData.igst_percent),
            gross_amount: parseFloat(formData.gross_amount) || 0,
            total_discount: parseFloat(formData.total_discount) || 0,
            total_add_amount: parseFloat(formData.total_add_amount) || 0,
            total_gst: calculateGst(),
            net_amount: calculateNetAmount(),
            lr_date: formData.lr_date || null,
            accounting_year: getCurrentAccountingYear(),
          },
        ])
        .select();

      if (error) throw error;

      alert('Sales invoice created successfully');
      onSuccess?.();
      setFormData(initialFormData);
    } catch (error) {
      console.error('[v0] Error creating sales invoice:', error);
      alert('Error creating invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Sales Invoice</CardTitle>
        <CardDescription>Enter sales invoice details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vno">VNo.</Label>
              <Input id="vno" name="vno" value={formData.vno} onChange={handleChange} placeholder="VNo." />
            </div>
            <div>
              <Label htmlFor="bill_no">Bill No.</Label>
              <Input id="bill_no" name="bill_no" value={formData.bill_no} onChange={handleChange} placeholder="Bill No." required />
            </div>
            <div>
              <Label htmlFor="bill_date">Bill Date</Label>
              <Input id="bill_date" type="date" name="bill_date" value={formData.bill_date} onChange={handleChange} required />
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
              <Label htmlFor="book">Book</Label>
              <Input id="book" name="book" value={formData.book} onChange={handleChange} placeholder="Book" />
            </div>
            <div>
              <Label htmlFor="bill_type">Bill Type</Label>
              <Select value={formData.bill_type} onValueChange={(value) => handleSelectChange('bill_type', value)}>
                <SelectTrigger id="bill_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inc. Excl.">Inc. Excl.</SelectItem>
                  <SelectItem value="Excluded">Excluded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="broker">Broker</Label>
              <Input id="broker" name="broker" value={formData.broker} onChange={handleChange} placeholder="Broker" />
            </div>
            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleSelectChange('payment_method', value)}>
                <SelectTrigger id="payment_method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Amount Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="gross_amount">Gross Amount</Label>
                <Input
                  id="gross_amount"
                  type="number"
                  name="gross_amount"
                  step="0.01"
                  value={formData.gross_amount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="total_discount">Discount</Label>
                <Input
                  id="total_discount"
                  type="number"
                  name="total_discount"
                  step="0.01"
                  value={formData.total_discount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="total_add_amount">Additional Amount</Label>
                <Input
                  id="total_add_amount"
                  type="number"
                  name="total_add_amount"
                  step="0.01"
                  value={formData.total_add_amount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Net Amount</Label>
                <Input type="text" value={calculateNetAmount().toFixed(2)} disabled className="bg-gray-100" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cgst_percent">CGST %</Label>
              <Input
                id="cgst_percent"
                type="number"
                name="cgst_percent"
                step="0.01"
                value={formData.cgst_percent}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="sgst_percent">SGST %</Label>
              <Input
                id="sgst_percent"
                type="number"
                name="sgst_percent"
                step="0.01"
                value={formData.sgst_percent}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="igst_percent">IGST %</Label>
              <Input
                id="igst_percent"
                type="number"
                name="igst_percent"
                step="0.01"
                value={formData.igst_percent}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="transport">Transport</Label>
              <Input id="transport" name="transport" value={formData.transport} onChange={handleChange} placeholder="Transport" />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
            </div>
            <div>
              <Label htmlFor="lr_date">LR Date</Label>
              <Input id="lr_date" type="date" name="lr_date" value={formData.lr_date} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="lr_no">LR No.</Label>
              <Input id="lr_no" name="lr_no" value={formData.lr_no} onChange={handleChange} placeholder="LR No." />
            </div>
          </div>
          <div>
            <Label htmlFor="remark">Remark</Label>
            <Textarea id="remark" name="remark" value={formData.remark} onChange={handleChange} placeholder="Remark" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
