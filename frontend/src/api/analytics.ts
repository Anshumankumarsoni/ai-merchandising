import { DashboardStats, InventoryDashboard } from "@/types/ai";
import apiClient from "./client";

export const analyticsApi = {
  dashboard: () =>
    apiClient.get<DashboardStats>("/analytics/dashboard/").then((r) => r.data),

  inventory: () =>
    apiClient.get<InventoryDashboard>("/analytics/inventory/").then((r) => r.data),

  aiUsage: () =>
    apiClient.get<{ by_type: { analysis_type: string; total: number; completed: number; failed: number }[] }>(
      "/analytics/ai-usage/"
    ).then((r) => r.data),
};
