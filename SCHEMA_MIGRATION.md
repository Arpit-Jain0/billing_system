-- Create companies table
CREATE TABLE IF NOT EXISTS saree.companies (
id BIGSERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
accounting_year VARCHAR(50),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create parties table (customers and suppliers)
CREATE TABLE IF NOT EXISTS saree.parties (
id BIGSERIAL PRIMARY KEY,
party_type VARCHAR(50) NOT NULL, -- 'customer' or 'supplier'
name VARCHAR(255) NOT NULL,
mobile VARCHAR(20),
email VARCHAR(255),
address TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create products table
CREATE TABLE IF NOT EXISTS saree.products (
id BIGSERIAL PRIMARY KEY,
barcode VARCHAR(100) UNIQUE NOT NULL,
item_name VARCHAR(255) NOT NULL,
unit VARCHAR(50),
hsn_code VARCHAR(50),
mrp DECIMAL(10, 2),
cost_price DECIMAL(10, 2),
stock INT DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create sales invoices table
CREATE TABLE IF NOT EXISTS saree.sales_invoices (
id BIGSERIAL PRIMARY KEY,
vno VARCHAR(50),
bill_no VARCHAR(50) UNIQUE,
bill_date DATE,
party_id BIGINT REFERENCES saree.parties(id),
book VARCHAR(100),
bill_type VARCHAR(100),
broker VARCHAR(255),
gross_amount DECIMAL(12, 2),
total_discount DECIMAL(12, 2),
total_add_amount DECIMAL(12, 2),
total_gst DECIMAL(12, 2),
net_amount DECIMAL(12, 2),
payment_method VARCHAR(50),
cgst_percent DECIMAL(5, 2),
sgst_percent DECIMAL(5, 2),
igst_percent DECIMAL(5, 2),
transport VARCHAR(255),
city VARCHAR(100),
lr_date DATE,
lr_no VARCHAR(50),
remark TEXT,
accounting_year VARCHAR(50) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create sales invoice items table
CREATE TABLE IF NOT EXISTS saree.sales_invoice_items (
id BIGSERIAL PRIMARY KEY,
invoice_id BIGINT REFERENCES saree.sales_invoices(id) ON DELETE CASCADE,
product_id BIGINT REFERENCES saree.products(id),
quantity INT,
unit_price DECIMAL(10, 2),
amount DECIMAL(12, 2),
discount DECIMAL(12, 2),
add_amount DECIMAL(12, 2),
gst_amount DECIMAL(12, 2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create purchase invoices table
CREATE TABLE IF NOT EXISTS saree.purchase_invoices (
id BIGSERIAL PRIMARY KEY,
vno VARCHAR(50),
bill_no VARCHAR(50) UNIQUE,
bill_date DATE,
party_id BIGINT REFERENCES saree.parties(id),
book VARCHAR(100),
gst_type VARCHAR(50),
broker VARCHAR(255),
total_amount DECIMAL(12, 2),
total_discount DECIMAL(12, 2),
total_add_amount DECIMAL(12, 2),
taxable_amount DECIMAL(12, 2),
cgst_percent DECIMAL(5, 2),
sgst_percent DECIMAL(5, 2),
igst_percent DECIMAL(5, 2),
transport VARCHAR(255),
lr_date DATE,
lr_no VARCHAR(50),
station VARCHAR(100),
bale_no VARCHAR(50),
freight DECIMAL(10, 2),
weight DECIMAL(10, 2),
remark TEXT,
accounting_year VARCHAR(50) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create purchase invoice items table
CREATE TABLE IF NOT EXISTS saree.purchase_invoice_items (
id BIGSERIAL PRIMARY KEY,
invoice_id BIGINT REFERENCES saree.purchase_invoices(id) ON DELETE CASCADE,
product_id BIGINT REFERENCES saree.products(id),
quantity INT,
unit_price DECIMAL(10, 2),
amount DECIMAL(12, 2),
discount DECIMAL(12, 2),
add_amount DECIMAL(12, 2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create receipts table
CREATE TABLE IF NOT EXISTS saree.receipts (
id BIGSERIAL PRIMARY KEY,
vno VARCHAR(50),
receipt_date DATE,
bank_cash VARCHAR(255),
current_balance DECIMAL(12, 2),
cheque_no VARCHAR(50),
cheque_date DATE,
party_id BIGINT REFERENCES saree.parties(id),
amount DECIMAL(12, 2),
reconciliation_date DATE,
on_account BOOLEAN DEFAULT FALSE,
remark TEXT,
accounting_year VARCHAR(50) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create receipt bills table
CREATE TABLE IF NOT EXISTS saree.receipt_bills (
id BIGSERIAL PRIMARY KEY,
receipt_id BIGINT REFERENCES saree.receipts(id) ON DELETE CASCADE,
bill_no VARCHAR(50),
bill_date DATE,
net_amount DECIMAL(12, 2),
paid_amount DECIMAL(12, 2),
tds_percent DECIMAL(5, 2),
tds_amount DECIMAL(12, 2),
discount_percent DECIMAL(5, 2),
discount_amount DECIMAL(12, 2),
adjust_amount DECIMAL(12, 2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create payments table
CREATE TABLE IF NOT EXISTS saree.payments (
id BIGSERIAL PRIMARY KEY,
vno VARCHAR(50),
payment_date DATE,
bank_cash VARCHAR(255),
payment_type VARCHAR(50),
cheque_no VARCHAR(50),
cheque_date DATE,
party_id BIGINT REFERENCES saree.parties(id),
amount DECIMAL(12, 2),
remark TEXT,
accounting_year VARCHAR(50) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create job dispatch table
CREATE TABLE IF NOT EXISTS saree.job_dispatch (
id BIGSERIAL PRIMARY KEY,
vno VARCHAR(50),
dispatch_date DATE,
job_no VARCHAR(50),
party_id BIGINT REFERENCES saree.parties(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create job dispatch items table
CREATE TABLE IF NOT EXISTS saree.job_dispatch_items (
id BIGSERIAL PRIMARY KEY,
dispatch_id BIGINT REFERENCES saree.job_dispatch(id) ON DELETE CASCADE,
product_id BIGINT REFERENCES saree.products(id),
quantity INT,
unit VARCHAR(50),
remark TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create job receipt table
CREATE TABLE IF NOT EXISTS saree.job_receipt (
id BIGSERIAL PRIMARY KEY,
vno VARCHAR(50),
receipt_date DATE,
job_no VARCHAR(50),
party_id BIGINT REFERENCES saree.parties(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Create job receipt items table
CREATE TABLE IF NOT EXISTS saree.job_receipt_items (
id BIGSERIAL PRIMARY KEY,
receipt_id BIGINT REFERENCES saree.job_receipt(id) ON DELETE CASCADE,
product_id BIGINT REFERENCES saree.products(id),
quantity INT,
unit VARCHAR(50),
remark TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);






ALTER TABLE saree.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.sales_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.purchase_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.receipt_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.job_dispatch ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.job_dispatch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.job_receipt ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree.job_receipt_items ENABLE ROW LEVEL SECURITY;








CREATE POLICY full_access_all ON saree.companies FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.parties FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.products FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.sales_invoices FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.sales_invoice_items FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.purchase_invoices FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.purchase_invoice_items FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.receipts FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.receipt_bills FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.payments FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.job_dispatch FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.job_dispatch_items FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.job_receipt FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY full_access_all ON saree.job_receipt_items FOR ALL TO PUBLIC USING (true) WITH CHECK (true);








-- Create indexes for better query performance
CREATE INDEX idx_parties_type ON saree.parties(party_type);
CREATE INDEX idx_products_barcode ON saree.products(barcode);
CREATE INDEX idx_sales_invoices_party ON saree.sales_invoices(party_id);
CREATE INDEX idx_sales_invoices_date ON saree.sales_invoices(bill_date);
CREATE INDEX idx_purchase_invoices_party ON saree.purchase_invoices(party_id);
CREATE INDEX idx_purchase_invoices_date ON saree.purchase_invoices(bill_date);
CREATE INDEX idx_receipts_party ON saree.receipts(party_id);
CREATE INDEX idx_receipts_date ON saree.receipts(receipt_date);
CREATE INDEX idx_payments_party ON saree.payments(party_id);
CREATE INDEX idx_payments_date ON saree.payments(payment_date);




-- Create indexes for better query performance with accounting year
CREATE INDEX idx_sales_invoices_fy ON saree.sales_invoices(accounting_year);
CREATE INDEX idx_purchase_invoices_fy ON saree.purchase_invoices(accounting_year);
CREATE INDEX idx_receipts_fy ON saree.receipts(accounting_year);
CREATE INDEX idx_payments_fy ON saree.payments(accounting_year);




-- Create product_items table for tracking individual dress units with unique IDs
CREATE TABLE IF NOT EXISTS saree.product_items (
 id BIGSERIAL PRIMARY KEY,
 item_id VARCHAR(100) UNIQUE NOT NULL,  -- Unique ID like PROD-20250121-A7F2K
 barcode VARCHAR(100) UNIQUE NOT NULL,  -- QR code / barcode for scanning
 product_id BIGINT REFERENCES saree.products(id),
 item_name VARCHAR(255) NOT NULL,       -- Product name (e.g., Silk Saree Red)
 purchase_price DECIMAL(10, 2),         -- Cost price when purchased
 sale_price DECIMAL(10, 2) NOT NULL,    -- Selling price
 status VARCHAR(50) DEFAULT 'available', -- 'available', 'sold', 'damaged', 'reserved'
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create indexes for faster lookups
CREATE INDEX idx_product_items_item_id ON saree.product_items(item_id);
CREATE INDEX idx_product_items_barcode ON saree.product_items(barcode);
CREATE INDEX idx_product_items_status ON saree.product_items(status);
CREATE INDEX idx_product_items_created ON saree.product_items(created_at);


-- Enable RLS
ALTER TABLE saree.product_items ENABLE ROW LEVEL SECURITY;


-- Create RLS policy for full access
CREATE POLICY full_access_product_items ON saree.product_items FOR ALL TO PUBLIC USING (true) WITH CHECK (true);


GRANT USAGE ON SCHEMA saree TO anon, authenticated;


GRANT USAGE ON SCHEMA saree TO anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA saree TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA saree TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA saree
GRANT ALL ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA saree
GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;



