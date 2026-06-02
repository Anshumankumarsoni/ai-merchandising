import { aiApi } from "@/api/aiTools";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const AI_HISTORY_KEY = "ai-history";

export function useAIHistory() {
  return useQuery({
    queryKey: [AI_HISTORY_KEY],
    queryFn: aiApi.listHistory,
  });
}

export function useGenerateDescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, productId }: { title: string; productId?: string }) =>
      aiApi.generateDescription(title, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AI_HISTORY_KEY] }),
  });
}

export function useClassifyProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, productId }: { name: string; productId?: string }) =>
      aiApi.classifyProduct(name, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AI_HISTORY_KEY] }),
  });
}

export function useAnalyzeReviews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviews, productId }: { reviews: string[]; productId?: string }) =>
      aiApi.analyzeReviews(reviews, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AI_HISTORY_KEY] }),
  });
}

export function useAnalyzeListingQuality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      description,
      productId,
    }: {
      title: string;
      description: string;
      productId?: string;
    }) => aiApi.analyzeListingQuality(title, description, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AI_HISTORY_KEY] }),
  });
}
