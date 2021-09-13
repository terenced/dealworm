export interface SearchResult {
  storeName?: string;
  price?: number;
  priceStr?: string;
  storeUrl?: string;
  storeImg?: string;
  updated?: number | Date;
  onSale?: boolean;
}

export const UNKNOWN_PRICE = -42;
