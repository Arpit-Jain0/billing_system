import QRCode from 'qrcode';

/**
 * Generate a unique product item ID with format: PROD-YYYYMMDD-XXXXX
 * Example: PROD-20250121-A7F2K
 */
export function generateProductItemId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PROD-${dateStr}-${randomStr}`;
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('[v0] Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate barcode for printing
 */
export async function generateBarcode(id: string): Promise<string> {
  // Using a simple barcode format that can be printed
  // In production, you might use a library like jsbarcode
  return generateQRCode(id);
}
