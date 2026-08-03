'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  party_type: string;
}

interface CustomerManagerProps {
  onSelectCustomer: (customer: Customer) => void;
  selectedCustomer?: Customer;
}

export function CustomerManager({ onSelectCustomer, selectedCustomer }: CustomerManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    party_type: 'customer',
  });

  // Fetch customers
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.schema('saree')
        .from('parties')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('[v0] Error fetching customers:', error);
    }
  };

  // Add new customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.mobile) {
      setMessage('Name and phone are required');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.schema('saree')
        .from('parties')
        .insert([
          {
            name: formData.name,
            mobile: formData.mobile,
            email: formData.email,
            address: formData.address,
            party_type: formData.party_type,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCustomers([...customers, data]);
      setFormData({ name: '', mobile: '', email: '', address: '', party_type: 'Customer' });
      setShowForm(false);
      setMessage('Customer added successfully');
      
      // Auto-select the new customer
      onSelectCustomer(data);
    } catch (error) {
      console.error('[v0] Error adding customer:', error);
      setMessage('Error adding customer');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Details</CardTitle>
        <CardDescription>Select or add a customer for this sale</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {selectedCustomer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{selectedCustomer.name}</p>
                <p className="text-sm text-gray-600">Phone: {selectedCustomer.mobile}</p>
                <p className="text-sm text-gray-600">Address: {selectedCustomer.address}</p>
                {selectedCustomer.email && (
                  <p className="text-sm text-gray-600">Email: {selectedCustomer.email}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectCustomer(null as any);
                  setMessage('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {!selectedCustomer && (
          <>
            <div className="space-y-2">
              <Label>Find or Select Customer</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 max-h-64 overflow-y-auto gap-2">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      onSelectCustomer(customer);
                      setSearchTerm('');
                      setMessage('');
                    }}
                    className="text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                  >
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.mobile}</p>
                  </button>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500">
                  {searchTerm ? 'No customers found' : 'Add a new customer to get started'}
                </p>
              )}
            </div>
          </>
        )}

        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Customer
          </Button>
        ) : (
          <form onSubmit={handleAddCustomer} className="space-y-3 border-t pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name" className="text-sm">Name *</Label>
                <Input
                  id="name"
                  placeholder="Customer name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobile" className="text-sm">Phone *</Label>
                <Input
                  id="mobile"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-sm">Address</Label>
              <Input
                id="address"
                placeholder="Customer address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Customer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '', mobile: '', email: '', address: '', party_type: 'Customer' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
