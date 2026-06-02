import { AIAnalysis } from "@/types/ai";
import apiClient from "./client";

export const aiApi = {
  generateDescription: (product_title: string, product_id?: string) =>
    apiClient
      .post<AIAnalysis>("/ai/generate-description/", { product_title, product_id })
      .then((r) => r.data),

  classifyProduct: (product_name: string, product_id?: string) =>
    apiClient
      .post<AIAnalysis>("/ai/classify-product/", { product_name, product_id })
      .then((r) => r.data),

  analyzeReviews: (reviews: string[], product_id?: string) =>
    apiClient
      .post<AIAnalysis>("/ai/analyze-reviews/", { reviews, product_id })
      .then((r) => r.data),

  analyzeListingQuality: (title: string, description: string, product_id?: string) =>
    apiClient
      .post<AIAnalysis>("/ai/analyze-listing/", { title, description, product_id })
      .then((r) => r.data),

  getAnalysis: (id: string) =>
    apiClient.get<AIAnalysis>(`/ai/history/${id}/`).then((r) => r.data),

  listHistory: () =>
    apiClient.get<{ results: AIAnalysis[] }>("/ai/history/").then((r) => r.data),
};
