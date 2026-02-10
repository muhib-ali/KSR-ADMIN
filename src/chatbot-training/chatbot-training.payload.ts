/**
 * Payload shape for Chatbot Training API product upsert.
 * Flattened names (category, brand, supplier, warehouse) so the Python API does not need to parse nested objects.
 * Excludes stock_quantity per requirement.
 */
export interface ChatbotVariantItem {
  type_name: string;
  value: string;
}

export interface ChatbotBulkPriceItem {
  quantity: number;
  price_per_product: number;
}

export interface ChatbotProductPayload {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  sku: string;
  category_name: string;
  brand_name: string;
  /** Selling price (same as price) */
  selling_price: number;
  cost?: number | null;
  freight?: number | null;
  /** Tax title/name */
  tax_title?: string | null;
  discount?: number;
  start_discount_date?: string | null;
  end_discount_date?: string | null;
  /** Bulk pricing tiers */
  bulk_pricing?: ChatbotBulkPriceItem[];
  /** Total cost (e.g. cost + freight per unit) */
  total_cost?: number | null;
  /** Price after discount (total_price or computed) */
  price_after_discount?: number | null;
  supplier_name?: string | null;
  warehouse_name?: string | null;
  /** All variants (type + value) */
  variants?: ChatbotVariantItem[];
  /** Custom variants only (excluding default size/model/year) */
  custom_variants?: ChatbotVariantItem[];
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  product_img_url?: string | null;
  product_video_url?: string | null;
}
