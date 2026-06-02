import { productsApi } from "@/api/products";
import { CreateProductPayload, ProductFilters } from "@/types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const PRODUCTS_KEY = "products";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn: () => productsApi.list(filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateProductPayload>) => productsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY, id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useUpdateInventory(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ count, reason }: { count: number; reason?: string }) =>
      productsApi.updateInventory(productId, count, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY, productId] });
    },
  });
}
