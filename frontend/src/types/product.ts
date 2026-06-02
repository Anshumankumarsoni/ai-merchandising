export type Marketplace = "amazon" | "ebay" | "shopify" | "walmart" | "etsy" | "other";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  website: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: Category | null;
  category_id?: string;
  brand: Brand | null;
  brand_id?: string;
  price: string;
  inventory_count: number;
  is_low_stock: boolean;
  marketplace: Marketplace;
  created_by_email?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductListItem {
  id: string;
  sku: string;
  name: string;
  category_name: string | null;
  brand_name: string | null;
  price: string;
  inventory_count: number;
  is_low_stock: boolean;
  marketplace: Marketplace;
  created_at: string;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  brand_id?: string;
  price: number;
  inventory_count: number;
  marketplace: Marketplace;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
  results: T[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  marketplace?: string;
  min_price?: number;
  max_price?: number;
  low_stock?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}
