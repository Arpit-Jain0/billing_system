'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateProductItemId, generateQRCode } from '@/lib/id-generator';

interface Product {
  id: number;
  item_name: string;
  barcode: string;
}

interface ProductItem {
  id: string;
  item_id: string;
  product_id: number;
  item_name: string;
  barcode: string;
  purchase_price: number;
  sale_price: number;
  status: string; // 'available', 'sold', 'damaged'
  created_at: string;
}

const emptyItemDetails = {
  item_id: '',
  product_id: '',
  item_name: '',
  purchase_price: 0,
  sale_price: 0,
  status: 'available',
};

const emptyNewProduct = {
  barcode: '',
  item_name: '',
  unit: '',
  hsn_code: '',
  mrp: '',
  cost_price: '',
};

export function ProductItemLookup({ companyId }: { companyId: number }) {
  const [searchId, setSearchId] = useState('');
  const [foundItem, setFoundItem] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [itemDetails, setItemDetails] = useState(emptyItemDetails);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [creatingItem, setCreatingItem] = useState(false);
  const [message, setMessage] = useState('');

  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState(emptyNewProduct);
  const [savingProduct, setSavingProduct] = useState(false);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .schema('saree')
      .from('products')
      .select('id, item_name, barcode')
      .eq('company_id', companyId)
      .order('item_name');
    if (!error) setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, [companyId]);

  // Lookup item by ID or barcode
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .schema('saree')
        .from('product_items')
        .select('*')
        .eq('company_id', companyId)
        .or(`item_id.eq.${searchId},barcode.eq.${searchId}`)
        .single();

      if (error) {
        setMessage('Product item not found');
        setFoundItem(null);
      } else {
        setFoundItem(data);
        setMessage('Product found!');
      }
    } catch (error) {
      console.error('[v0] Lookup error:', error);
      setMessage('Error looking up product');
    } finally {
      setLoading(false);
    }
  };

  // Generate new product item ID and QR code
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingItem(true);
    setMessage('');

    try {
      const newItemId = generateProductItemId();
      const qr = await generateQRCode(newItemId);

      setQrCode(qr);
      setItemDetails({
        ...itemDetails,
        item_id: newItemId,
      });

      setMessage(`Generated Item ID: ${newItemId}`);
    } catch (error) {
      console.error('[v0] Error creating item:', error);
      setMessage('Error generating item ID');
    } finally {
      setCreatingItem(false);
    }
  };

  // Save product item to database
  const handleSaveItem = async () => {
    if (!itemDetails.item_id || !itemDetails.item_name || itemDetails.sale_price <= 0) {
      setMessage('Please fill all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .schema('saree')
        .from('product_items')
        .insert([
          {
            company_id: companyId,
            item_id: itemDetails.item_id,
            product_id: itemDetails.product_id ? parseInt(itemDetails.product_id) : null,
            item_name: itemDetails.item_name,
            barcode: itemDetails.item_id, // Use item_id as barcode
            purchase_price: itemDetails.purchase_price,
            sale_price: itemDetails.sale_price,
            status: itemDetails.status,
          },
        ])
        .select();

      if (error) throw error;

      setMessage('Product item saved successfully!');
      setItemDetails(emptyItemDetails);
      setQrCode(null);
    } catch (error) {
      console.error('[v0] Save error:', error);
      setMessage('Error saving product item');
    }
  };

  // Save a new SKU (products table) so it's selectable above
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.barcode || !newProduct.item_name) {
      setMessage('Barcode and product name are required');
      return;
    }

    setSavingProduct(true);
    try {
      const { data, error } = await supabase
        .schema('saree')
        .from('products')
        .insert([
          {
            company_id: companyId,
            barcode: newProduct.barcode,
            item_name: newProduct.item_name,
            unit: newProduct.unit || null,
            hsn_code: newProduct.hsn_code || null,
            mrp: newProduct.mrp ? parseFloat(newProduct.mrp) : null,
            cost_price: newProduct.cost_price ? parseFloat(newProduct.cost_price) : null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setProducts((prev) => [...prev, data].sort((a, b) => a.item_name.localeCompare(b.item_name)));
      setItemDetails((prev) => ({ ...prev, product_id: String(data.id) }));
      setNewProduct(emptyNewProduct);
      setShowNewProduct(false);
      setMessage(`Product "${data.item_name}" created`);
    } catch (error) {
      console.error('[v0] Error adding product:', error);
      setMessage('Error adding product');
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lookup Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Lookup Product Item</CardTitle>
          <CardDescription>Search by Item ID or Barcode</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <Label htmlFor="search_id">Item ID / Barcode</Label>
              <Input
                id="search_id"
                placeholder="Enter item ID or scan barcode..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Searching...' : 'Lookup Item'}
            </Button>
          </form>

          {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}

          {foundItem && (
            <div className="mt-6 space-y-3 border-t pt-4">
              <div>
                <p className="text-sm text-slate-500">Item ID</p>
                <p className="font-semibold">{foundItem.item_id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Product Name</p>
                <p className="font-semibold">{foundItem.item_name}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Purchase Price</p>
                  <p className="font-semibold">₹ {foundItem.purchase_price}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Sale Price</p>
                  <p className="font-semibold text-green-600">₹ {foundItem.sale_price}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-semibold capitalize">{foundItem.status}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Item Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Product Item</CardTitle>
          <CardDescription>Generate unique ID for a new dress/product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!itemDetails.item_id ? (
            <Button onClick={handleCreateItem} disabled={creatingItem} className="w-full" size="lg">
              {creatingItem ? 'Generating...' : 'Generate New Item ID'}
            </Button>
          ) : (
            <>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                {qrCode && <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="mx-auto mb-2" />}
                <p className="text-sm text-slate-600">Item ID</p>
                <p className="font-mono font-bold text-lg break-all">{itemDetails.item_id}</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="product_id">Product (SKU)</Label>
                  <button
                    type="button"
                    onClick={() => setShowNewProduct((v) => !v)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    {showNewProduct ? 'Cancel' : '+ New product'}
                  </button>
                </div>
                {!showNewProduct ? (
                  <Select
                    value={itemDetails.product_id}
                    onValueChange={(value) => setItemDetails({ ...itemDetails, product_id: value })}
                  >
                    <SelectTrigger id="product_id">
                      <SelectValue placeholder={products.length ? 'Link to a product' : 'No products yet - add one'} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.item_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <form onSubmit={handleAddProduct} className="space-y-2 border rounded-lg p-3 mt-2 bg-slate-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        placeholder="Barcode *"
                        value={newProduct.barcode}
                        onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Product name *"
                        value={newProduct.item_name}
                        onChange={(e) => setNewProduct({ ...newProduct, item_name: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Unit (e.g. pcs)"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      />
                      <Input
                        placeholder="HSN code"
                        value={newProduct.hsn_code}
                        onChange={(e) => setNewProduct({ ...newProduct, hsn_code: e.target.value })}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="MRP"
                        value={newProduct.mrp}
                        onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Cost price"
                        value={newProduct.cost_price}
                        onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                      />
                    </div>
                    <Button type="submit" size="sm" disabled={savingProduct} className="w-full">
                      {savingProduct ? 'Saving...' : 'Save product'}
                    </Button>
                  </form>
                )}
              </div>

              <div>
                <Label htmlFor="item_name">Product Name *</Label>
                <Input
                  id="item_name"
                  placeholder="e.g., Silk Saree Red"
                  value={itemDetails.item_name}
                  onChange={(e) => setItemDetails({ ...itemDetails, item_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_price">Purchase Price</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={itemDetails.purchase_price}
                    onChange={(e) =>
                      setItemDetails({ ...itemDetails, purchase_price: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sale_price">Sale Price *</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={itemDetails.sale_price}
                    onChange={(e) =>
                      setItemDetails({ ...itemDetails, sale_price: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={itemDetails.status}
                  onChange={(e) => setItemDetails({ ...itemDetails, status: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveItem} className="flex-1" size="lg">
                  Save Item
                </Button>
                <Button
                  onClick={() => {
                    setItemDetails(emptyItemDetails);
                    setQrCode(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>

              {message && <p className="text-sm text-green-600">{message}</p>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
