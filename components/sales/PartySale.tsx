'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCurrentAccountingYear, getLocalDateString } from '@/lib/invoice-utils';

interface Party {
  id: number;
  name: string;
  mobile: string;
  address: string;
}

const initialFormData = {
  vno: '',
  bill_no: '',
  bill_date: getLocalDateString(),
  party_id: '',
  book: 'JS',
  bill_type: 'Inc. Excl.',
  broker: '',
  payment_method: 'Cash',
  cgst_percent: '9',
  sgst_percent: '9',
  igst_percent: '18',
  gross_amount: '0',
  total_discount: '0',
  total_add_amount: '0',
  transport: '',
  city: '',
  lr_date: '',
  lr_no: '',
  remark: '',
};

export function PartySale({ companyId }: { companyId: number }) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState(initialFormData);

  // Fetch parties on mount
  useEffect(() => {
    fetchParties();
  }, [companyId]);

  const fetchParties = async () => {
    try {
      const { data, error } = await supabase.schema('saree')
        .from('parties')
        .select('id, name, mobile, address')
        .eq('company_id', companyId)
        .eq('party_type', 'customer');

      if (error) throw error;
      setParties(data || []);
    } catch (error) {
      console.error('[v0] Error fetching parties:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateGst = () => {
    const gross = parseFloat(formData.gross_amount) || 0;
    const discount = parseFloat(formData.total_discount) || 0;
    const additionalAmount = parseFloat(formData.total_add_amount) || 0;

    const gstPercent = formData.bill_type === 'Inc. Excl.'
      ? (parseFloat(formData.cgst_percent) || 0) + (parseFloat(formData.sgst_percent) || 0)
      : (parseFloat(formData.igst_percent) || 0);

    return ((gross - discount + additionalAmount) * gstPercent) / 100;
  };

  const calculateNetAmount = () => {
    const gross = parseFloat(formData.gross_amount) || 0;
    const discount = parseFloat(formData.total_discount) || 0;
    const additionalAmount = parseFloat(formData.total_add_amount) || 0;

    return gross - discount + additionalAmount + calculateGst();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bill_no || !formData.party_id) {
      setMessage('Bill number and party are required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const invoiceData = {
        company_id: companyId,
        vno: formData.vno || null,
        bill_no: formData.bill_no,
        bill_date: formData.bill_date,
        party_id: parseInt(formData.party_id),
        book: formData.book,
        bill_type: formData.bill_type,
        broker: formData.broker || null,
        payment_method: formData.payment_method,
        cgst_percent: parseFloat(formData.cgst_percent) || 0,
        sgst_percent: parseFloat(formData.sgst_percent) || 0,
        igst_percent: parseFloat(formData.igst_percent) || 0,
        gross_amount: parseFloat(formData.gross_amount) || 0,
        total_discount: parseFloat(formData.total_discount) || 0,
        total_add_amount: parseFloat(formData.total_add_amount) || 0,
        total_gst: calculateGst(),
        net_amount: calculateNetAmount(),
        transport: formData.transport || null,
        city: formData.city || null,
        lr_date: formData.lr_date || null,
        lr_no: formData.lr_no || null,
        remark: formData.remark || null,
        accounting_year: getCurrentAccountingYear(),
      };

      const { data, error } = await supabase.schema('saree')
        .from('sales_invoices')
        .insert([invoiceData])
        .select();

      if (error) {
        setMessage(`Error: ${error.message}`);
        return;
      }

      setMessage('Party sales bill created successfully!');
      
      // Reset form
      setTimeout(() => {
        setFormData(initialFormData);
      }, 1500);
    } catch (error) {
      console.error('[v0] Error creating party sale:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Party/Bulk Sales</CardTitle>
        <CardDescription>Create bulk sales invoices for parties or distributors</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert className={message.includes('Error') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className={message.includes('Error') ? 'text-red-800' : 'text-green-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Details */}
          <div>
            <h3 className="font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="vno">VNo.</Label>
                <Input
                  id="vno"
                  name="vno"
                  value={formData.vno}
                  onChange={handleChange}
                  placeholder="VNo."
                />
              </div>
              <div>
                <Label htmlFor="bill_no">Bill No. *</Label>
                <Input
                  id="bill_no"
                  name="bill_no"
                  value={formData.bill_no}
                  onChange={handleChange}
                  placeholder="Bill No."
                  required
                />
              </div>
              <div>
                <Label htmlFor="bill_date">Bill Date</Label>
                <Input
                  id="bill_date"
                  type="date"
                  name="bill_date"
                  value={formData.bill_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="party_id">Party *</Label>
                <Select value={formData.party_id} onValueChange={(value) => handleSelectChange('party_id', value)}>
                  <SelectTrigger id="party_id">
                    <SelectValue placeholder="Select party" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map((party) => (
                      <SelectItem key={party.id} value={party.id.toString()}>
                        {party.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Amount Details */}
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
                  placeholder="0.00"
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
                  placeholder="0.00"
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
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Net Amount</Label>
                <Input
                  type="text"
                  value={calculateNetAmount().toFixed(2)}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Tax and Payment */}
          <div>
            <h3 className="font-semibold mb-4">Tax & Payment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleSelectChange('payment_method', value)}>
                  <SelectTrigger id="payment_method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Transport & Logistics */}
          <div>
            <h3 className="font-semibold mb-4">Transport & Logistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="transport">Transport</Label>
                <Input
                  id="transport"
                  name="transport"
                  value={formData.transport}
                  onChange={handleChange}
                  placeholder="Transport name"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="lr_date">LR Date</Label>
                <Input
                  id="lr_date"
                  type="date"
                  name="lr_date"
                  value={formData.lr_date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="lr_no">LR No.</Label>
                <Input
                  id="lr_no"
                  name="lr_no"
                  value={formData.lr_no}
                  onChange={handleChange}
                  placeholder="LR No."
                />
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div>
            <Label htmlFor="broker">Broker</Label>
            <Input
              id="broker"
              name="broker"
              value={formData.broker}
              onChange={handleChange}
              placeholder="Broker name"
            />
          </div>

          <div>
            <Label htmlFor="remark">Remarks</Label>
            <Textarea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Add any remarks or notes"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Party Sale Bill'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
