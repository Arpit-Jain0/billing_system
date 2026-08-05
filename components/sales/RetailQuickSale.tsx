'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Trash2, Plus, Printer } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CustomerManager } from './CustomerManager';
import { getCurrentAccountingYear, getLocalDateString } from '@/lib/invoice-utils';

interface SalesItem {
  id: string;
  item_id: string;
  item_name: string;
  product_id: number | null;
  purchase_price: number;
  sale_price: number;
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  party_type: string;
}

export function RetailQuickSale({ companyId }: { companyId: number }) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState(getLocalDateString());

  const [itemSearch, setItemSearch] = useState('');
  const [currentItem, setCurrentItem] = useState<SalesItem | null>(null);
  const [salesItems, setSalesItems] = useState<SalesItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  // Lookup item by ID or barcode
  const handleLookupItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .schema('saree')
        .from('product_items')
        .select('*')
        .eq('company_id', companyId)
        .or(`item_id.eq.${itemSearch},barcode.eq.${itemSearch}`)
        .single();

      if (error) {
        setMessage('Item not found. Please check the ID or barcode.');
        setMessageType('error');
        setCurrentItem(null);
      } else if (data.status !== 'available') {
        setMessage(`This item is marked '${data.status}' and cannot be sold.`);
        setMessageType('error');
        setCurrentItem(null);
      } else {
        setCurrentItem({
          id: data.id,
          item_id: data.item_id,
          item_name: data.item_name,
          product_id: data.product_id ?? null,
          purchase_price: data.purchase_price || 0,
          sale_price: data.sale_price || 0,
          quantity: 1,
        });
        setMessage(`Found: ${data.item_name}`);
        setMessageType('success');
      }
    } catch (error) {
      console.error('[v0] Lookup error:', error);
      setMessage('Error looking up item');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Add item to sales list
  const handleAddItem = () => {
    if (!currentItem) {
      setMessage('Please lookup an item first');
      setMessageType('error');
      return;
    }

    const alreadyAdded = salesItems.some((item) => item.id === currentItem.id);

    if (alreadyAdded) {
      setMessage('This item is already in the invoice.');
      setMessageType('error');
      return;
    }

    // Each product_items row is one physical, uniquely-barcoded saree, so it
    // can only ever be sold as quantity 1 - it isn't a stackable SKU.
    setSalesItems([...salesItems, { ...currentItem, quantity: 1 }]);

    setItemSearch('');
    setCurrentItem(null);
    setMessage('Item added to invoice');
    setMessageType('success');
  };

  const handleRemoveItem = (id: string) => {
    setSalesItems(salesItems.filter((item) => item.id !== id));
  };

  // Calculate totals
  const grossAmount = salesItems.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);
  const gst = grossAmount * 0.18; // Assuming 18% GST
  const netAmount = grossAmount + gst;

  // Save invoice
  const handleSaveInvoice = async () => {
    if (!billNo || !selectedCustomer) {
      setMessage('Please enter bill number and select a customer');
      setMessageType('error');
      return;
    }

    if (salesItems.length === 0) {
      setMessage('Please add at least one item');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .schema('saree')
        .from('sales_invoices')
        .insert([
          {
            company_id: companyId,
            bill_no: billNo,
            bill_date: billDate,
            party_id: selectedCustomer.id,
            gross_amount: grossAmount,
            total_gst: gst,
            net_amount: netAmount,
            accounting_year: getCurrentAccountingYear(),
          },
        ])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Add invoice items
      const itemsData = salesItems.map((item) => ({
        company_id: companyId,
        invoice_id: invoiceData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.sale_price,
        amount: item.sale_price * item.quantity,
        discount: 0,
        add_amount: 0,
        gst_amount: item.sale_price * item.quantity * 0.18,
      }));

      const { error: itemsError } = await supabase
        .schema('saree')
        .from('sales_invoice_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      // Mark the sold physical items so they can't be scanned/sold again
      const soldItemIds = salesItems.map((item) => item.id);
      const { error: statusError } = await supabase
        .schema('saree')
        .from('product_items')
        .update({ status: 'sold' })
        .eq('company_id', companyId)
        .in('id', soldItemIds);

      if (statusError) throw statusError;

      setMessage('Invoice saved successfully!');
      setMessageType('success');

      // Reset form
      setTimeout(() => {
        setBillNo('');
        setSalesItems([]);
        setSelectedCustomer(null);
      }, 1500);
    } catch (error) {
      console.error('[v0] Save error:', error);
      setMessage(`Error saving invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Section */}
      <CustomerManager companyId={companyId} onSelectCustomer={setSelectedCustomer} selectedCustomer={selectedCustomer || undefined} />

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billNo">Bill Number *</Label>
              <Input
                id="billNo"
                placeholder="e.g., INV-001"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="billDate">Date</Label>
              <Input
                id="billDate"
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Item Lookup */}
      <Card>
        <CardHeader>
          <CardTitle>Add Items</CardTitle>
          <CardDescription>Scan or enter product ID/barcode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={messageType === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className={messageType === 'error' ? 'text-red-800' : 'text-green-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLookupItem} className="space-y-3">
            <div>
              <Label htmlFor="itemSearch">Product ID / Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="itemSearch"
                  placeholder="Scan or type ID (e.g., PROD-20250121-A7F2K)"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  autoFocus
                />
                <Button type="submit" disabled={loading || !itemSearch}>
                  Search
                </Button>
              </div>
            </div>
          </form>

          {currentItem && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-semibold">{currentItem.item_name}</p>
              <p className="text-sm text-gray-600">ID: {currentItem.item_id}</p>
              <p className="text-sm font-medium mt-2">
                Sale Price: ₹{currentItem.sale_price.toFixed(2)}
              </p>

              <div className="flex gap-2 mt-3">
                <Button onClick={handleAddItem} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Items Summary */}
      {salesItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items in Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {salesItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-gray-600">
                      ₹{item.sale_price.toFixed(2)} × {item.quantity} = ₹
                      {(item.sale_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{grossAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{netAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveInvoice}
                disabled={loading || !selectedCustomer}
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                Save & Print Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => setSalesItems([])}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
