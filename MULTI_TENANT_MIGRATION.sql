-- Multi-tenant upgrade migration.
-- Run this ONCE in the Supabase SQL Editor, on top of SCHEMA_MIGRATION.md,
-- BEFORE deploying the multi-tenant app code. See DEPLOYMENT.md for the
-- full ordered checklist this belongs to.
--
-- What this does:
--   1. Adds a unique `slug` to saree.companies (the subdomain for each shop)
--      and makes sure at least one company row exists to own current data.
--   2. Adds `company_id` to every business table, backfilled to that company.
--   3. Fixes globally-unique columns (barcode, bill_no, item_id) to be
--      unique per company instead of unique across all shops.
--   4. Creates saree.user_companies, mapping Supabase Auth users to the
--      shop(s) they can access.
--   5. Replaces every "wide open" RLS policy with one scoped to company_id.
--
-- Safe to re-run: every step is idempotent (IF NOT EXISTS / IF EXISTS guards).

-- ============================================================
-- 1. companies.slug + ensure a default company exists
-- ============================================================
ALTER TABLE saree.companies ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

DO $$
DECLARE
  default_company_id BIGINT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM saree.companies) THEN
    INSERT INTO saree.companies (name, slug, accounting_year)
    VALUES ('My Shop', 'main', '2026-2027')
    RETURNING id INTO default_company_id;
  ELSE
    UPDATE saree.companies SET slug = 'main' WHERE slug IS NULL
      AND id = (SELECT id FROM saree.companies ORDER BY id LIMIT 1);
    SELECT id INTO default_company_id FROM saree.companies ORDER BY id LIMIT 1;
  END IF;

  -- ============================================================
  -- 2. company_id on every business table, backfilled to the
  --    default company so existing rows keep working.
  -- ============================================================
  ALTER TABLE saree.parties ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.products ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.product_items ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.sales_invoices ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.sales_invoice_items ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.purchase_invoices ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.purchase_invoice_items ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.receipts ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.receipt_bills ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.payments ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.job_dispatch ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.job_dispatch_items ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.job_receipt ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);
  ALTER TABLE saree.job_receipt_items ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES saree.companies(id);

  UPDATE saree.parties SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.products SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.product_items SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.sales_invoices SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.sales_invoice_items SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.purchase_invoices SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.purchase_invoice_items SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.receipts SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.receipt_bills SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.payments SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.job_dispatch SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.job_dispatch_items SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.job_receipt SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE saree.job_receipt_items SET company_id = default_company_id WHERE company_id IS NULL;
END $$;

ALTER TABLE saree.companies ALTER COLUMN slug SET NOT NULL;
ALTER TABLE saree.parties ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.products ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.product_items ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.sales_invoices ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.sales_invoice_items ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.purchase_invoices ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.purchase_invoice_items ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.receipts ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.receipt_bills ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.payments ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.job_dispatch ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.job_dispatch_items ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.job_receipt ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE saree.job_receipt_items ALTER COLUMN company_id SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_slug_key') THEN
    ALTER TABLE saree.companies ADD CONSTRAINT companies_slug_key UNIQUE (slug);
  END IF;
END $$;

-- ============================================================
-- 3. Make previously-global-unique columns unique per company
-- ============================================================
ALTER TABLE saree.products DROP CONSTRAINT IF EXISTS products_barcode_key;
ALTER TABLE saree.sales_invoices DROP CONSTRAINT IF EXISTS sales_invoices_bill_no_key;
ALTER TABLE saree.purchase_invoices DROP CONSTRAINT IF EXISTS purchase_invoices_bill_no_key;
ALTER TABLE saree.product_items DROP CONSTRAINT IF EXISTS product_items_item_id_key;
ALTER TABLE saree.product_items DROP CONSTRAINT IF EXISTS product_items_barcode_key;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_company_barcode_key') THEN
    ALTER TABLE saree.products ADD CONSTRAINT products_company_barcode_key UNIQUE (company_id, barcode);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_invoices_company_bill_no_key') THEN
    ALTER TABLE saree.sales_invoices ADD CONSTRAINT sales_invoices_company_bill_no_key UNIQUE (company_id, bill_no);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_invoices_company_bill_no_key') THEN
    ALTER TABLE saree.purchase_invoices ADD CONSTRAINT purchase_invoices_company_bill_no_key UNIQUE (company_id, bill_no);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_items_company_item_id_key') THEN
    ALTER TABLE saree.product_items ADD CONSTRAINT product_items_company_item_id_key UNIQUE (company_id, item_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_items_company_barcode_key') THEN
    ALTER TABLE saree.product_items ADD CONSTRAINT product_items_company_barcode_key UNIQUE (company_id, barcode);
  END IF;
END $$;

-- Index every company_id column - every query and RLS check filters on it.
CREATE INDEX IF NOT EXISTS idx_parties_company ON saree.parties(company_id);
CREATE INDEX IF NOT EXISTS idx_products_company ON saree.products(company_id);
CREATE INDEX IF NOT EXISTS idx_product_items_company ON saree.product_items(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_company ON saree.sales_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_items_company ON saree.sales_invoice_items(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_company ON saree.purchase_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_invoice_items_company ON saree.purchase_invoice_items(company_id);
CREATE INDEX IF NOT EXISTS idx_receipts_company ON saree.receipts(company_id);
CREATE INDEX IF NOT EXISTS idx_receipt_bills_company ON saree.receipt_bills(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_company ON saree.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_job_dispatch_company ON saree.job_dispatch(company_id);
CREATE INDEX IF NOT EXISTS idx_job_dispatch_items_company ON saree.job_dispatch_items(company_id);
CREATE INDEX IF NOT EXISTS idx_job_receipt_company ON saree.job_receipt(company_id);
CREATE INDEX IF NOT EXISTS idx_job_receipt_items_company ON saree.job_receipt_items(company_id);

-- ============================================================
-- 4. user_companies: which Supabase Auth users can see which shops
-- ============================================================
CREATE TABLE IF NOT EXISTS saree.user_companies (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id BIGINT NOT NULL REFERENCES saree.companies(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff', -- owner | admin | staff | viewer
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, company_id)
);
ALTER TABLE saree.user_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_sees_own_memberships ON saree.user_companies;
CREATE POLICY user_sees_own_memberships ON saree.user_companies
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Helper function: every table's RLS policy calls this instead of
-- repeating the subquery, and SECURITY DEFINER means it doesn't pay
-- for user_companies' own RLS check on every row of every other table.
CREATE OR REPLACE FUNCTION saree.user_company_ids()
RETURNS SETOF BIGINT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = saree, pg_temp
AS $$
  SELECT company_id FROM saree.user_companies WHERE user_id = auth.uid();
$$;

-- ============================================================
-- 5. Replace every wide-open policy with a company-scoped one
-- ============================================================

-- companies: name/slug aren't sensitive - anyone (even signed-out, so
-- middleware and the login page can resolve a subdomain) can look them
-- up. Only membership rows and business data are actually protected.
DROP POLICY IF EXISTS full_access_all ON saree.companies;
DROP POLICY IF EXISTS companies_public_lookup ON saree.companies;
CREATE POLICY companies_public_lookup ON saree.companies
  FOR SELECT TO anon, authenticated
  USING (true);

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'parties', 'products', 'product_items',
    'sales_invoices', 'sales_invoice_items',
    'purchase_invoices', 'purchase_invoice_items',
    'receipts', 'receipt_bills', 'payments',
    'job_dispatch', 'job_dispatch_items',
    'job_receipt', 'job_receipt_items'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS full_access_all ON saree.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS full_access_product_items ON saree.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS company_scoped ON saree.%I', t);
    EXECUTE format(
      'CREATE POLICY company_scoped ON saree.%I FOR ALL TO authenticated
         USING (company_id IN (SELECT saree.user_company_ids()))
         WITH CHECK (company_id IN (SELECT saree.user_company_ids()))',
      t
    );
  END LOOP;
END $$;

-- Business data no longer needs to be reachable by unauthenticated
-- requests at all - only signed-in members of a shop can read/write it.
REVOKE ALL ON ALL TABLES IN SCHEMA saree FROM anon;
GRANT SELECT ON saree.companies TO anon;
GRANT USAGE ON SCHEMA saree TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA saree TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA saree TO authenticated;

-- ============================================================
-- Manual step after running this file (see DEPLOYMENT.md):
--   1. Create your first Supabase Auth user (Dashboard -> Authentication -> Users).
--   2. Link them to a shop:
--        INSERT INTO saree.user_companies (user_id, company_id, role)
--        VALUES ('<auth-user-uuid>', <company-id>, 'owner');
--   3. Add more shops any time with:
--        INSERT INTO saree.companies (name, slug, accounting_year)
--        VALUES ('Shop B', 'shopb', '2026-2027');
-- ============================================================
