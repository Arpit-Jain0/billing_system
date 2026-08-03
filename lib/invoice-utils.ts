export interface SalesInvoice {
  id: number;
  vno: string;
  bill_no: string;
  bill_date: string;
  party_id: number;
  party_name: string;
  book: string;
  bill_type: string;
  broker: string;
  gross_amount: number;
  total_discount: number;
  total_add_amount: number;
  total_gst: number;
  net_amount: number;
  payment_method: string;
  cgst_percent: number;
  sgst_percent: number;
  igst_percent: number;
  transport: string;
  city: string;
  lr_date: string;
  lr_no: string;
  remark: string;
  items: InvoiceItem[];
}

export interface PurchaseInvoice {
  id: number;
  vno: string;
  bill_no: string;
  bill_date: string;
  party_id: number;
  party_name: string;
  book: string;
  gst_type: string;
  broker: string;
  total_amount: number;
  total_discount: number;
  total_add_amount: number;
  taxable_amount: number;
  cgst_percent: number;
  sgst_percent: number;
  igst_percent: number;
  transport: string;
  lr_date: string;
  lr_no: string;
  station: string;
  bale_no: string;
  freight: number;
  weight: number;
  remark: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  barcode: string;
  item_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  amount: number;
  discount: number;
  add_amount: number;
  gst_amount: number;
}

export const calculateInvoiceTotals = (items: InvoiceItem[]) => {
  const grossAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const totalAddAmount = items.reduce((sum, item) => sum + item.add_amount, 0);
  const totalGst = items.reduce((sum, item) => sum + item.gst_amount, 0);
  const netAmount = grossAmount - totalDiscount + totalAddAmount + totalGst;

  return { grossAmount, totalDiscount, totalAddAmount, totalGst, netAmount };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

// Returns today's date as YYYY-MM-DD in local time (unlike toISOString, which
// converts to UTC first and misdates the last few hours of the IST day).
export const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Indian financial year runs April 1 - March 31, e.g. "2026-2027".
export const getCurrentAccountingYear = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};
