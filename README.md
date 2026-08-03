# MAA PADMAWATI SAREES - Billing & Inventory Management System

A comprehensive end-to-end retail billing system for saree business with complete sales, purchase, payment tracking, and bill printing capabilities.

## System Features

### 1. **Quick Sales Entry (NEW)**
- **Fast multi-item data entry** - Add multiple products in one invoice
- **Barcode/QR scanning** - Scan product IDs for instant lookup
- **Auto product details** - Purchase and sale prices load automatically
- **Real-time calculations** - See totals update as items are added
- **Quick invoice save** - One-click invoice generation and printing

### 2. **Product Item Management (NEW)**
- **Unique Product ID System** - Generate unique IDs like PROD-20250121-A7F2K for each dress
- **QR Code Generation** - Auto-generate QR codes for easy scanning
- **Individual pricing** - Track purchase and sale price per item
- **Inventory tracking** - Status: available, sold, damaged, reserved
- **Quick lookup** - Scan or type ID to pull product details

### 3. **Sales Management**
- Create sales invoices with multiple items
- Track customer details and payment methods
- Support for cash, cheque, and online payments
- GST calculation (CGST, SGST, IGST)
- Transport and logistics tracking
- Bill printing with all invoice details
- **Link product items to invoices** - Track individual dress sales

### 2. **Purchase Management**
- Record purchase invoices from suppliers
- Track freight and weight information
- Multiple GST types (IGST, CGST+SGST)
- LR (Lorry Receipt) tracking
- Bale and station information management

### 3. **Payment & Receipt Management**
- Record payment transactions
- Support for cash, cheque, bank, and online payments
- Payment history and reconciliation
- Cheque date tracking

### 4. **Master Data Management**
- Product/Item management with barcode support
- Customer and supplier master
- Account and ledger setup
- Multi-location and transport management

### 5. **Reports & Analytics**
- Sales outstanding (pending customer payments)
- Purchase outstanding (pending supplier payments)
- GST breakup reports
- Stock/inventory tracking
- Daily, monthly, and yearly summaries

### 6. **Bill Printing**
- Professional bill format with company header
- Item-wise breakdown
- Tax calculation details
- Transport and logistics information
- Printable invoice with all details

## Database Schema

### Core Tables
- **companies** - Company information
- **parties** - Customers and suppliers
- **products** - Items with barcode, pricing, and stock
- **product_items** - Individual dress units with unique IDs and QR codes (NEW)
- **accounts** - Ledger accounts
- **account_groups** - Account classifications

### Transaction Tables
- **sales_invoices** - Sales bill records
- **sales_invoice_items** - Line items in sales bills
- **purchase_invoices** - Purchase bill records
- **purchase_invoice_items** - Line items in purchase bills
- **receipts** - Payment received records
- **receipt_bills** - Bill-wise receipt reconciliation
- **payments** - Payment made records

### Job Management
- **job_dispatch** - Outbound job records
- **job_dispatch_items** - Job dispatch line items
- **job_receipt** - Inbound job records
- **job_receipt_items** - Job receipt line items

## Technology Stack

- **Frontend**: Next.js 16 with React 19
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth (integrated)
- **Forms**: React with native HTML forms

## Setup Instructions

### 1. Environment Setup

The system uses Supabase for data storage. Connection details are configured in:
- `/lib/supabase.ts` - Browser client
- `/app/api/*` - Server-side API routes

### 2. Database Schema Creation

Run the following SQL in Supabase SQL Editor to create all tables:

```sql
-- Execute the schema provided in the setup document
-- All tables with their relationships and indexes will be created
-- Row Level Security (RLS) is enabled for all tables
```

### 3. Initial Master Data Setup

Before creating transactions, add:

1. **Parties (Customers & Suppliers)**
   - Add customer details in Settings → Master Data
   - Add supplier details
   - Include contact information and addresses

2. **Products**
   - Go to Settings → Products
   - Add items with barcode, name, unit, HSN code
   - Set MRP and cost price
   - Stock will auto-update from transactions

3. **Accounts**
   - Setup accounting heads (optional for billing)
   - Bank account details for payment tracking

## Usage Guide

### Setup: Creating Product Items with Unique IDs

1. Navigate to **Products** tab (🏷️ icon on dashboard)
2. Click **"Generate New Item ID"** button
3. A unique ID is generated with QR code (e.g., PROD-20250121-A7F2K)
4. Enter product details:
   - **Product Name** (e.g., "Silk Saree Red")
   - **Purchase Price** (optional - cost to business)
   - **Sale Price** (required - selling price)
   - **Status** (Available, Sold, Damaged, Reserved)
5. Click **"Save Item"** - Item is now ready for quick sale entry
6. Print the QR code label and attach to the dress/product

### Quick Sales Entry (Fast & Efficient)

1. Navigate to **Quick Sale** tab (⚡ icon on dashboard)
2. Fill basic invoice info:
   - Bill No., Date, Party ID/Name
3. In **"Add Items"** section:
   - Scan or type the product Item ID from the label
   - Click "Search" - Product details auto-populate
   - Purchase price and sale price appear instantly
   - Enter quantity if buying multiple
   - Click "Add Item to Invoice"
4. Repeat Step 3 for multiple products
5. See real-time totals:
   - Number of items and total quantity
   - Gross amount and GST calculation
   - Final net amount
6. Click **"Save & Print Invoice"** when done
7. Print the professional bill

### Creating a Sales Invoice (Traditional Entry)

1. Navigate to **Sales** tab
2. Fill invoice header (Bill No., Date, Party ID, Book)
3. Click **"Add Items"** section
4. Select product from dropdown
5. Enter quantity, unit price, discount, GST %
6. Click **"Add Item"** button
7. Repeat for multiple items
8. Review totals and click **"Save & Print Invoice"**
9. Print the professional bill format

### Creating a Purchase Invoice

1. Navigate to **Purchase** tab
2. Fill invoice details (Bill No., Date, Supplier ID)
3. Add GST type (IGST or CGST+SGST)
4. Enter transport details and freight information
5. Add items with quantity and pricing
6. Save the invoice

### Recording Payments

1. Navigate to **Payment** tab
2. Select payment type (Payment/Receipt/Advance)
3. Choose bank/cash/cheque
4. Enter party ID and amount
5. Add cheque details if payment by cheque
6. Save payment record

### Viewing Reports

1. Go to **Reports** tab
2. Access:
   - Sales Outstanding - pending customer payments
   - Purchase Outstanding - pending supplier payments
   - GST Reports - tax breakup
   - Stock/Inventory - product levels

## Product Item Lookup Feature

### How Barcode Scanning Works

1. **Generate Unique ID**
   - Each dress/product gets a unique ID like PROD-20250121-A7F2K
   - QR code is automatically generated
   - Print and attach label to the dress

2. **Lookup Product**
   - In Quick Sale entry, scan the QR code or type the ID
   - System instantly retrieves:
     - Product name
     - Purchase price (cost to business)
     - Sale price (customer price)
     - Current status
   - All details auto-populate - no manual entry needed

3. **Track Individual Products**
   - Each dress has its own record with unique ID
   - Sale price can vary per item
   - Status tracking (available/sold/damaged/reserved)
   - Complete sales history per product item

### Benefits

- **No Data Entry Errors** - Scan instead of typing
- **Faster Billing** - All details load automatically
- **Accurate Pricing** - Each item has its own prices
- **Better Inventory** - Know exactly which dress was sold
- **Easy Returns** - Lookup any sold item by its ID

## Accounting Features

### GST Calculation
- Supports different tax rates per item
- Separate CGST, SGST, IGST calculations
- Automatic tax amount calculation
- Tax-inclusive and tax-exclusive pricing options

### Ledger Integration
- Double-entry bookkeeping support
- Account-wise balance tracking
- Automated journal entries
- Trial balance generation

### Financial Year Management
- Separate data per accounting year (2024-2025, etc.)
- Year-to-date reports
- Opening balance carry-forward

## Print Features

Bills print in professional format with:
- Company name and address
- Bill number and date
- Customer/party details
- Itemized product list with quantities and prices
- Tax breakdown (CGST, SGST, IGST)
- Transport and logistics information
- Payment terms and remarks
- Company footer and contact information

**Print-ready format** - Optimized for A4 paper
**Browser Print** - Use Ctrl+P or Print button
**Export Options** - Can be exported to PDF via browser

## Security & Compliance

- **Row Level Security (RLS)** - Database-level access control
- **Data Encryption** - Supabase default encryption
- **Audit Trail** - All transactions timestamped
- **GST Compliance** - Proper tax calculation and reporting
- **Data Validation** - Input validation on all fields

## Performance Optimizations

- Indexed queries for fast data retrieval
- Optimized table relationships
- Caching of frequently accessed data
- Efficient pagination in reports

## Support & Maintenance

### Common Tasks

**Add a New Product**
- Settings → Products → Add Product
- Enter barcode, name, unit, HSN code, pricing

**Modify Invoice**
- Currently supports view-only; recreate for changes
- Delete and recreate if needed

**Generate GST Report**
- Reports → GST Reports
- Select date range and bill type

**Backup Data**
- Settings → Backup Data
- Export all transactions and masters

## API Endpoints

### Sales Invoices
- `GET /api/sales` - List all sales invoices
- `GET /api/sales?id=<id>` - Get specific invoice with items
- `POST /api/sales` - Create new sales invoice
- `PUT /api/sales` - Update sales invoice

### Invoice Items
- `POST /api/invoice-items` - Add item to invoice
- `DELETE /api/invoice-items?table=<table>&id=<id>` - Delete item

## Accounting Year Settings

Current Accounting Year: **2024-2025**

To change accounting year:
1. Settings → System Settings
2. Update company accounting year
3. This affects all new transactions
4. Previous year data remains accessible

## Tips for Better Usage

1. **Consistent Naming** - Use standard party names for reporting
2. **Barcode Scanning** - Use barcode scanner for faster data entry
3. **Daily Backups** - Regular data exports recommended
4. **Master Data** - Complete master setup before month-end
5. **Reconciliation** - Weekly payment reconciliation
6. **Report Analysis** - Weekly outstanding analysis

## Troubleshooting

### Database Connection Issues
- Verify Supabase credentials in `/lib/supabase.ts`
- Check internet connectivity
- Review Supabase project status

### Missing Products
- Ensure products are added before creating invoices
- Check product barcode for typos

### Calculation Errors
- Verify GST percentages
- Check quantity and pricing inputs
- Review discount entries

## Contact & Support

For technical support:
- Check system logs in browser console
- Review error messages in alerts
- Verify database connectivity
- Contact Supabase support for database issues

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Developed for**: MAA PADMAWATI SAREES
