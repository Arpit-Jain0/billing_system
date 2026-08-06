-- Team management + role enforcement upgrade.
-- Run this in the Supabase SQL Editor AFTER MULTI_TENANT_MIGRATION.sql.
-- Safe to re-run.
--
-- What this does:
--   1. Adds a write-eligibility helper (everyone but 'viewer').
--   2. Splits every table's single FOR ALL policy into read (any member)
--      vs. write (non-viewer member) - today every role, including
--      'viewer', can write. This makes 'viewer' actually read-only.
--   3. Lets owner/admin update their own shop's profile (name, year).
--   4. Grants the `service_role` Postgres role access to the `saree`
--      schema. Supabase only auto-exposes `public` to service_role -
--      a custom schema needs this explicitly, or every /api/settings/*
--      call (which uses the service-role key server-side) fails with
--      "permission denied for schema saree" (42501), even though
--      service_role bypasses RLS - GRANTs are a separate layer RLS
--      bypass doesn't cover.

GRANT USAGE ON SCHEMA saree TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA saree TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA saree TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA saree GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA saree GRANT USAGE, SELECT ON SEQUENCES TO service_role;

CREATE OR REPLACE FUNCTION saree.user_write_company_ids()
RETURNS SETOF BIGINT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = saree, pg_temp
AS $$
  SELECT company_id FROM saree.user_companies WHERE user_id = auth.uid() AND role <> 'viewer';
$$;

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
    EXECUTE format('DROP POLICY IF EXISTS company_scoped ON saree.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS company_read ON saree.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS company_write ON saree.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS company_modify ON saree.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS company_delete ON saree.%I', t);

    EXECUTE format(
      'CREATE POLICY company_read ON saree.%I FOR SELECT TO authenticated
         USING (company_id IN (SELECT saree.user_company_ids()))',
      t
    );
    EXECUTE format(
      'CREATE POLICY company_write ON saree.%I FOR INSERT TO authenticated
         WITH CHECK (company_id IN (SELECT saree.user_write_company_ids()))',
      t
    );
    EXECUTE format(
      'CREATE POLICY company_modify ON saree.%I FOR UPDATE TO authenticated
         USING (company_id IN (SELECT saree.user_write_company_ids()))
         WITH CHECK (company_id IN (SELECT saree.user_write_company_ids()))',
      t
    );
    EXECUTE format(
      'CREATE POLICY company_delete ON saree.%I FOR DELETE TO authenticated
         USING (company_id IN (SELECT saree.user_write_company_ids()))',
      t
    );
  END LOOP;
END $$;

-- Owner/admin can edit their own shop's profile. Team management itself
-- (inviting/removing members) goes through /api/settings/team, which
-- uses the service-role key server-side and authorizes the caller
-- against user_companies before doing anything - so no client-facing
-- RLS write policy is added for user_companies itself.
DROP POLICY IF EXISTS companies_update_by_admin ON saree.companies;
CREATE POLICY companies_update_by_admin ON saree.companies
  FOR UPDATE TO authenticated
  USING (id IN (SELECT company_id FROM saree.user_companies WHERE user_id = auth.uid() AND role IN ('owner', 'admin')))
  WITH CHECK (id IN (SELECT company_id FROM saree.user_companies WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
