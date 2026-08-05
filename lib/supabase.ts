import { createBrowserClient } from '@supabase/ssr';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type Database = {
  saree: {
    Tables: {
      companies: {
        Row: { id: number; name: string; slug: string; accounting_year: string; created_at: string };
        Insert: { name: string; slug: string; accounting_year: string };
      };
      user_companies: {
        Row: { user_id: string; company_id: number; role: 'owner' | 'admin' | 'staff' | 'viewer'; created_at: string };
        Insert: { user_id: string; company_id: number; role?: 'owner' | 'admin' | 'staff' | 'viewer' };
      };
      parties: {
        Row: { id: number; company_id: number; party_type: string; name: string; mobile: string; email: string; address: string; created_at: string };
        Insert: { company_id: number; party_type: string; name: string; mobile?: string; email?: string; address?: string };
      };
      products: {
        Row: { id: number; company_id: number; barcode: string; item_name: string; unit: string; hsn_code: string; mrp: number; cost_price: number; stock: number; created_at: string };
        Insert: { company_id: number; barcode: string; item_name: string; unit?: string; hsn_code?: string; mrp?: number; cost_price?: number };
      };
      product_items: {
        Row: { id: number; company_id: number; item_id: string; product_id?: number; item_name: string; barcode: string; purchase_price: number; sale_price: number; status: string; created_at: string };
        Insert: { company_id: number; item_id: string; product_id?: number; item_name: string; barcode: string; purchase_price?: number; sale_price: number; status?: string };
      };
      sales_invoices: {
        Row: any;
        Insert: any;
      };
      sales_invoice_items: {
        Row: any;
        Insert: any;
      };
      purchase_invoices: {
        Row: any;
        Insert: any;
      };
      purchase_invoice_items: {
        Row: any;
        Insert: any;
      };
      receipts: {
        Row: any;
        Insert: any;
      };
      receipt_bills: {
        Row: any;
        Insert: any;
      };
      payments: {
        Row: any;
        Insert: any;
      };
      job_dispatch: {
        Row: any;
        Insert: any;
      };
      job_dispatch_items: {
        Row: any;
        Insert: any;
      };
      job_receipt: {
        Row: any;
        Insert: any;
      };
      job_receipt_items: {
        Row: any;
        Insert: any;
      };
    };
  };
};
