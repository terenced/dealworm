export interface SearchResult {
  storeName?: string;
  price?: number;
  priceStr?: string;
  storeUrl?: string;
  storeImg?: string;
  updated?: number | Date;
  onSale?: boolean;
}
