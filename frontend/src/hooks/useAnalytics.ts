import { analyticsApi } from "@/api/analytics";
import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: analyticsApi.dashboard,
    staleTime: 60_000,
  });
}

export function useInventoryDashboard() {
  return useQuery({
    queryKey: ["analytics", "inventory"],
    queryFn: analyticsApi.inventory,
    staleTime: 60_000,
  });
}

export function useAIUsage() {
  return useQuery({
    queryKey: ["analytics", "ai-usage"],
    queryFn: analyticsApi.aiUsage,
    staleTime: 60_000,
  });
}
