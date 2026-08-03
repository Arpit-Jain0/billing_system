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
