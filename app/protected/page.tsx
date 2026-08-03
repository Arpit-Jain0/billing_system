'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  FileText,
  Truck,
  Wallet,
  BarChart3,
  Menu,
  LogOut,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { SalesForm } from '@/components/sales/SalesForm';
import { RetailQuickSale } from '@/components/sales/RetailQuickSale';
import { PartySale } from '@/components/sales/PartySale';
import { ProductItemLookup } from '@/components/sales/ProductItemLookup';
import { PurchaseForm } from '@/components/purchase/PurchaseForm';
import { PaymentEntry } from '@/components/payment/PaymentEntry';
import { ReceiptsList } from '@/components/reports/ReceiptsList';
import { SalesList } from '@/components/reports/SalesList';
import { PurchaseList } from '@/components/reports/PurchaseList';
import { getCurrentAccountingYear } from '@/lib/invoice-utils';

const NAV_ITEMS = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'quick-sale', label: 'Retail Sale', icon: ShoppingCart },
  { value: 'party-sale', label: 'Party Sale', icon: Package },
  { value: 'product', label: 'Products', icon: Tag },
  { value: 'sales', label: 'Sales', icon: FileText },
  { value: 'purchase', label: 'Purchase', icon: Truck },
  { value: 'payment', label: 'Payment', icon: Wallet },
  { value: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Logout */}
        <div className="mb-6 md:mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden shrink-0" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <SheetHeader className="border-b">
                  <SheetTitle>MAA PADMAWATI SAREES</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                  {NAV_ITEMS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setActiveTab(value);
                        setNavOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        activeTab === value
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </nav>
                <div className="p-4 border-t">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <h1 className="text-xl md:text-4xl font-bold text-slate-900 truncate">MAA PADMAWATI SAREES</h1>
              <p className="hidden sm:block text-lg text-slate-600 mt-2">Billing & Inventory Management System</p>
              <p className="sm:hidden text-sm font-medium text-slate-700 mt-1">
                {NAV_ITEMS.find((item) => item.value === activeTab)?.label}
              </p>
              <p className="text-xs md:text-sm text-slate-500 mt-1">Accounting Year: {getCurrentAccountingYear()}</p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
            <div className="text-sm text-slate-600">
              Logged in as: <span className="font-medium text-slate-900">{user?.email}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden md:grid w-full grid-cols-8">
            {NAV_ITEMS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Today Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹0.00</div>
                  <p className="text-xs text-slate-500 mt-1">0 invoices</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Today Purchase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹0.00</div>
                  <p className="text-xs text-slate-500 mt-1">0 invoices</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending Receivables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹0.00</div>
                  <p className="text-xs text-slate-500 mt-1">0 customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending Payables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹0.00</div>
                  <p className="text-xs text-slate-500 mt-1">0 suppliers</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
                <CardDescription>Quick links to frequently used transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <button
                    onClick={() => setActiveTab('quick-sale')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <div className="text-2xl mb-2">🛒</div>
                    <div className="text-sm font-medium">Retail Sale</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('party-sale')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <div className="text-2xl mb-2">📦</div>
                    <div className="text-sm font-medium">Party/Bulk Sale</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('product')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <div className="text-2xl mb-2">🏷️</div>
                    <div className="text-sm font-medium">Manage Products</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('sales')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <div className="text-2xl mb-2">📄</div>
                    <div className="text-sm font-medium">Sales Bill</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('purchase')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <div className="text-2xl mb-2">📦</div>
                    <div className="text-sm font-medium">Purchase Bill</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm font-medium">Reports</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retail Quick Sale Tab */}
          <TabsContent value="quick-sale" className="mt-6">
            <RetailQuickSale />
          </TabsContent>

          {/* Party/Bulk Sale Tab */}
          <TabsContent value="party-sale" className="mt-6">
            <PartySale />
          </TabsContent>

          {/* Product Management Tab */}
          <TabsContent value="product" className="mt-6">
            <ProductItemLookup />
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SalesForm onSuccess={handleSuccess} />
              </div>
              <div className="lg:col-span-2">
                <SalesList key={refreshTrigger} />
              </div>
            </div>
          </TabsContent>

          {/* Purchase Tab */}
          <TabsContent value="purchase" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PurchaseForm onSuccess={handleSuccess} />
              </div>
              <div className="lg:col-span-2">
                <PurchaseList key={refreshTrigger} />
              </div>
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PaymentEntry onSuccess={handleSuccess} />
              </div>
              <div className="lg:col-span-2">
                <ReceiptsList key={refreshTrigger} />
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>View sales, purchase, and payment reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition text-left">
                    <div className="font-medium text-slate-900">Sales Outstanding</div>
                    <div className="text-sm text-slate-500 mt-1">Pending customer payments</div>
                  </button>
                  <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition text-left">
                    <div className="font-medium text-slate-900">Purchase Outstanding</div>
                    <div className="text-sm text-slate-500 mt-1">Pending supplier payments</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
