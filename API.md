# API Documentation - MAA PADMAWATI SAREES

## Overview

The system provides REST API endpoints for all major operations. All endpoints use Supabase as the backend with schema: `saree`.

---

## Authentication

All API requests use Supabase client authentication configured in:
- **Browser Client**: `/lib/supabase.ts`
- **Connection**: Direct Supabase client with anonymous key

No additional authentication headers required for development.

---

## Base URLs

```
Development: http://localhost:3000/api/
Production: https://yourapp.example.com/api/
Database: set via NEXT_PUBLIC_SUPABASE_URL in .env.local
```

---

## API Endpoints

### Sales Management

#### 1. Get All Sales Invoices
```http
GET /api/sales
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "bill_no": "1001",
      "bill_date": "2025-01-21",
      "party_id": 1,
      "gross_amount": 5000,
      "total_gst": 900,
      "net_amount": 5900,
      "created_at": "2025-01-21T10:30:00Z"
    }
  ],
  "error": null
}
```

---

#### 2. Get Sales Invoice with Items
```http
GET /api/sales?id=1
```

**Response**:
```json
{
  "data": {
    "id": 1,
    "bill_no": "1001",
    "bill_date": "2025-01-21",
    "party_id": 1,
    "gross_amount": 5000,
    "total_gst": 900,
    "net_amount": 5900,
    "sales_invoice_items": [
      {
        "id": 10,
        "item_name": "Silk Saree Red",
        "quantity": 2,
        "unit_price": 2500,
        "amount": 5000,
        "gst_amount": 900
      }
    ],
    "created_at": "2025-01-21T10:30:00Z"
  },
  "error": null
}
```

---

#### 3. Create Sales Invoice
```http
POST /api/sales
Content-Type: application/json

{
  "bill_no": "1002",
  "bill_date": "2025-01-21",
  "party_id": 1,
  "book": "SAL-MP",
  "bill_type": "Inc. Excl.",
  "gross_amount": 5000,
  "total_discount": 0,
  "total_add_amount": 0,
  "total_gst": 900,
  "net_amount": 5900,
  "cgst_percent": 9,
  "sgst_percent": 9,
  "igst_percent": 18,
  "accounting_year": "2024-2025"
}
```

**Response**:
```json
{
  "data": [
    {
      "id": 2,
      "bill_no": "1002",
      "bill_date": "2025-01-21",
      "party_id": 1,
      "net_amount": 5900,
      "created_at": "2025-01-21T11:00:00Z"
    }
  ],
  "error": null
}
```

---

#### 4. Update Sales Invoice
```http
PUT /api/sales
Content-Type: application/json

{
  "id": 1,
  "bill_no": "1001-UPDATED",
  "gross_amount": 5500,
  "net_amount": 6490
}
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "bill_no": "1001-UPDATED",
      "net_amount": 6490
    }
  ],
  "error": null
}
```

---

### Invoice Items

#### 5. Add Item to Invoice
```http
POST /api/invoice-items
Content-Type: application/json

{
  "table": "sales_invoice_items",
  "data": {
    "invoice_id": 1,
    "item_id": "PROD-20250121-A7F2K",
    "product_item_id": 5,
    "quantity": 2,
    "unit_price": 2500,
    "purchase_price": 1500,
    "sale_price": 2500,
    "amount": 5000
  }
}
```

**Response**:
```json
{
  "data": [
    {
      "id": 10,
      "invoice_id": 1,
      "quantity": 2,
      "amount": 5000,
      "created_at": "2025-01-21T10:35:00Z"
    }
  ],
  "error": null
}
```

---

#### 6. Delete Item from Invoice
```http
DELETE /api/invoice-items?table=sales_invoice_items&id=10
```

**Response**:
```json
{
  "data": null,
  "error": null,
  "message": "Item deleted successfully"
}
```

---

## Data Models

### Sales Invoice
```typescript
interface SalesInvoice {
  id: number;
  vno?: string;
  bill_no: string;
  bill_date: string; // YYYY-MM-DD
  party_id: number;
  book?: string;
  bill_type?: string;
  broker?: string;
  gross_amount: number;
  total_discount: number;
  total_add_amount: number;
  total_gst: number;
  net_amount: number;
  payment_method?: string;
  cgst_percent?: number;
  sgst_percent?: number;
  igst_percent?: number;
  transport?: string;
  city?: string;
  lr_date?: string;
  lr_no?: string;
  remark?: string;
  accounting_year: string;
  created_at: string;
}
```

---

### Sales Invoice Item
```typescript
interface SalesInvoiceItem {
  id: number;
  invoice_id: number;
  product_id?: number;
  item_id?: string;
  product_item_id?: number;
  quantity: number;
  unit_price: number;
  purchase_price?: number;
  sale_price?: number;
  amount: number;
  discount?: number;
  add_amount?: number;
  gst_amount?: number;
  created_at: string;
}
```

---

### Product Item
```typescript
interface ProductItem {
  id: number;
  item_id: string; // PROD-YYYYMMDD-XXXXX
  product_id?: number;
  barcode: string;
  item_name: string;
  purchase_price?: number;
  sale_price: number;
  status: 'available' | 'sold' | 'damaged' | 'reserved';
  created_at: string;
}
```

---

### Party (Customer/Supplier)
```typescript
interface Party {
  id: number;
  party_type: 'customer' | 'supplier';
  name: string;
  mobile?: string;
  email?: string;
  address?: string;
  created_at: string;
}
```

---

## Database Queries

### Lookup Product Item by ID
```typescript
const { data, error } = await supabase
  .schema('saree')
  .from('product_items')
  .select('*')
  .or(`item_id.eq.${itemId},barcode.eq.${itemId}`)
  .single();
```

---

### Fetch Sales Invoice with Items
```typescript
const { data, error } = await supabase
  .schema('saree')
  .from('sales_invoices')
  .select(`
    *,
    sales_invoice_items(*)
  `)
  .eq('id', invoiceId)
  .single();
```

---

### Create Sales Invoice with Items
```typescript
// 1. Create invoice
const { data: invoiceData, error: invoiceError } = await supabase
  .schema('saree')
  .from('sales_invoices')
  .insert([invoicePayload])
  .select();

const invoiceId = invoiceData[0].id;

// 2. Add items
const itemsPayload = items.map(item => ({
  invoice_id: invoiceId,
  ...item
}));

const { error: itemsError } = await supabase
  .schema('saree')
  .from('sales_invoice_items')
  .insert(itemsPayload);
```

---

## Error Handling

### Error Response Format
```json
{
  "data": null,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `product_item_not_found` | Item ID doesn't exist | Check item ID and scan correctly |
| `party_not_found` | Party ID invalid | Verify party exists in system |
| `duplicate_bill_no` | Bill number already used | Use unique bill number |
| `missing_required_field` | Required field empty | Fill all * marked fields |
| `database_error` | Supabase connection error | Check internet and credentials |

---

## Rate Limiting

No explicit rate limiting implemented. Supabase default limits apply:
- **Requests**: Based on project plan
- **Concurrent**: Up to 100 concurrent connections
- **Size**: Max 1 MB per request

---

## Pagination

List endpoints support pagination:

```http
GET /api/sales?offset=0&limit=10
```

---

## Caching

No response caching implemented. Each request hits the database.
For performance, client-side caching recommended:

```typescript
const { data, isLoading, mutate } = useSWR(
  '/api/sales',
  fetcher,
  { revalidateOnFocus: false }
);
```

---

## Real-Time Updates

Not implemented in v1.0. Consider for future:
- Supabase Realtime subscriptions
- WebSocket connections
- Live updates for concurrent users

---

## Testing API Endpoints

### Using cURL
```bash
# Get all sales
curl http://localhost:3000/api/sales

# Create sales invoice
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{"bill_no":"1001","party_id":1,"net_amount":5900}'

# Get specific invoice
curl http://localhost:3000/api/sales?id=1
```

### Using Postman
1. Create new collection "MAA PADMAWATI"
2. Add requests for each endpoint
3. Set base URL: `http://localhost:3000/api`
4. Test and validate responses

### Using Browser Console
```javascript
// Fetch all sales
fetch('/api/sales')
  .then(r => r.json())
  .then(data => console.log(data))

// Create invoice
fetch('/api/sales', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bill_no: '1001',
    party_id: 1,
    net_amount: 5900
  })
})
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## Integration Examples

### Quick Sale Entry Flow
```typescript
// 1. Lookup product item
const { data: product } = await fetch('/api/product-items?id=PROD-20250121-A7F2K')

// 2. Create invoice
const { data: invoice } = await fetch('/api/sales', {
  method: 'POST',
  body: JSON.stringify(invoiceData)
})

// 3. Add items
for (const item of items) {
  await fetch('/api/invoice-items', {
    method: 'POST',
    body: JSON.stringify({
      table: 'sales_invoice_items',
      data: { invoice_id: invoice.id, ...item }
    })
  })
}

// 4. Print
window.print()
```

---

## Monitoring & Logging

### Browser Console
All API calls log errors to console:
```javascript
console.error('[v0] Error fetching sales:', error)
console.log('[v0] Invoice created:', data)
```

### Supabase Dashboard
Monitor all database operations:
- Real-time editor shows all changes
- Query performance metrics
- Error logs and debugging

---

## Security Considerations

1. **Authentication**: Anonymous access (development only)
   - Production: Implement Supabase Auth
   - Use session tokens or API keys

2. **Row Level Security**: Enabled on all tables
   - Policies allow full access (dev only)
   - Production: Restrict by user/company

3. **Input Validation**: Client-side only
   - Server-side validation recommended
   - Implement rate limiting

4. **Data Encryption**: Default Supabase encryption
   - All data encrypted at rest
   - HTTPS for all connections

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2025 | Initial API, Sales & Invoice endpoints |
| 1.1 | Jan 2025 | Product Items endpoint, QR code support |
| 2.0 | TBD | Purchase, Payments, Reports endpoints |

---

## Support

For API issues:
1. Check Supabase logs
2. Verify schema: `saree`
3. Check browser console for errors
4. Review this documentation
5. Check database credentials

---

**API Version**: 1.1
**Last Updated**: January 21, 2025
**Status**: Production Ready
