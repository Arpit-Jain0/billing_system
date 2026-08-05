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
  gst_type: 'IGST',
  broker: '',
  total_amount: '0',
  total_discount: '0',
  total_add_amount: '0',
  cgst_percent: '9',
  sgst_percent: '9',
  igst_percent: '18',
  transport: '',
  lr_date: '',
  lr_no: '',
  station: '',
  bale_no: '',
  freight: '0',
  weight: '0',
  remark: '',
};

export function PurchaseForm({ companyId, onSuccess }: { companyId: number; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTaxableAmount = () => {
    const total = parseFloat(formData.total_amount) || 0;
    const discount = parseFloat(formData.total_discount) || 0;
    const addAmount = parseFloat(formData.total_add_amount) || 0;
    return total - discount + addAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.schema('saree').from('purchase_invoices').insert([
        {
          ...formData,
          company_id: companyId,
          party_id: parseInt(formData.party_id),
          cgst_percent: parseFloat(formData.cgst_percent),
          sgst_percent: parseFloat(formData.sgst_percent),
          igst_percent: parseFloat(formData.igst_percent),
          freight: parseFloat(formData.freight),
          weight: parseFloat(formData.weight),
          total_amount: parseFloat(formData.total_amount) || 0,
          total_discount: parseFloat(formData.total_discount) || 0,
          total_add_amount: parseFloat(formData.total_add_amount) || 0,
          taxable_amount: calculateTaxableAmount(),
          lr_date: formData.lr_date || null,
          accounting_year: getCurrentAccountingYear(),
        },
      ]);

      if (error) throw error;

      alert('Purchase invoice created successfully');
      onSuccess?.();
      setFormData(initialFormData);
    } catch (error) {
      console.error('[v0] Error creating purchase invoice:', error);
      alert('Error creating invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Purchase Invoice</CardTitle>
        <CardDescription>Enter purchase invoice details</CardDescription>
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
              <Label htmlFor="party_id">Party ID (Supplier)</Label>
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
              <Label htmlFor="gst_type">GST Type</Label>
              <Select value={formData.gst_type} onValueChange={(value) => handleSelectChange('gst_type', value)}>
                <SelectTrigger id="gst_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IGST">IGST</SelectItem>
                  <SelectItem value="CGST+SGST">CGST+SGST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="broker">Broker</Label>
              <Input id="broker" name="broker" value={formData.broker} onChange={handleChange} placeholder="Broker" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Amount Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="total_amount">Total Amount</Label>
                <Input
                  id="total_amount"
                  type="number"
                  name="total_amount"
                  step="0.01"
                  value={formData.total_amount}
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
                <Label>Taxable Amount</Label>
                <Input type="text" value={calculateTaxableAmount().toFixed(2)} disabled className="bg-gray-100" />
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
              <Label htmlFor="station">Station</Label>
              <Input id="station" name="station" value={formData.station} onChange={handleChange} placeholder="Station" />
            </div>
            <div>
              <Label htmlFor="lr_date">LR Date</Label>
              <Input id="lr_date" type="date" name="lr_date" value={formData.lr_date} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="lr_no">LR No.</Label>
              <Input id="lr_no" name="lr_no" value={formData.lr_no} onChange={handleChange} placeholder="LR No." />
            </div>
            <div>
              <Label htmlFor="bale_no">Bale No.</Label>
              <Input id="bale_no" name="bale_no" value={formData.bale_no} onChange={handleChange} placeholder="Bale No." />
            </div>
            <div>
              <Label htmlFor="freight">Freight</Label>
              <Input
                id="freight"
                type="number"
                step="0.01"
                name="freight"
                value={formData.freight}
                onChange={handleChange}
                placeholder="Freight"
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight"
              />
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
