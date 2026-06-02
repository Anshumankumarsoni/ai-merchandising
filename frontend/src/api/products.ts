import {
  Brand,
  Category,
  CreateProductPayload,
  PaginatedResponse,
  Product,
  ProductFilters,
  ProductListItem,
} from "@/types/product";
import apiClient from "./client";

export const productsApi = {
  list: (filters?: ProductFilters) =>
    apiClient
      .get<PaginatedResponse<ProductListItem>>("/catalog/products/", { params: filters })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Product>(`/catalog/products/${id}/`).then((r) => r.data),

  create: (payload: CreateProductPayload) =>
    apiClient.post<Product>("/catalog/products/", payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateProductPayload>) =>
    apiClient.patch<Product>(`/catalog/products/${id}/`, payload).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/catalog/products/${id}/`),

  updateInventory: (id: string, new_count: number, change_reason?: string) =>
    apiClient
      .post<Product>(`/catalog/products/${id}/update_inventory/`, { new_count, change_reason })
      .then((r) => r.data),

  inventoryHistory: (id: string) =>
    apiClient.get(`/catalog/products/${id}/inventory_history/`).then((r) => r.data),
};

export const categoriesApi = {
  list: () =>
    apiClient.get<PaginatedResponse<Category>>("/catalog/categories/").then((r) => r.data),
  create: (name: string, parent?: string) =>
    apiClient.post<Category>("/catalog/categories/", { name, parent }).then((r) => r.data),
};

export const brandsApi = {
  list: () =>
    apiClient.get<PaginatedResponse<Brand>>("/catalog/brands/").then((r) => r.data),
  create: (name: string, website?: string) =>
    apiClient.post<Brand>("/catalog/brands/", { name, website }).then((r) => r.data),
};
