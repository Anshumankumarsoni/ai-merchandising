import { categoriesApi, brandsApi } from "@/api/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, parent }: { name: string; parent?: string }) =>
      categoriesApi.create(name, parent),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, website }: { name: string; website?: string }) =>
      brandsApi.create(name, website),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });
}
