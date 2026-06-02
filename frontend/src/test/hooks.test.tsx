import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Wrapper for hooks that need react-query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Mock products API
vi.mock("@/api/products", () => ({
  productsApi: {
    list: vi.fn().mockResolvedValue({ count: 2, results: [], total_pages: 1, current_page: 1, next: null, previous: null }),
    get: vi.fn().mockResolvedValue({ id: "1", sku: "SKU-001", name: "Test Product", price: "99.99", inventory_count: 50, is_low_stock: false, marketplace: "amazon", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
    create: vi.fn().mockResolvedValue({ id: "2", sku: "SKU-002", name: "New Product" }),
    update: vi.fn().mockResolvedValue({ id: "1", name: "Updated Product" }),
    delete: vi.fn().mockResolvedValue(undefined),
    updateInventory: vi.fn().mockResolvedValue({ inventory_count: 100 }),
    inventoryHistory: vi.fn().mockResolvedValue([]),
  },
  categoriesApi: {
    list: vi.fn().mockResolvedValue({ count: 0, results: [] }),
    create: vi.fn(),
  },
  brandsApi: {
    list: vi.fn().mockResolvedValue({ count: 0, results: [] }),
    create: vi.fn(),
  },
}));

vi.mock("@/api/aiTools", () => ({
  aiApi: {
    generateDescription: vi.fn().mockResolvedValue({ id: "ai-1", status: "pending", analysis_type: "description" }),
    classifyProduct: vi.fn().mockResolvedValue({ id: "ai-2", status: "pending", analysis_type: "classification" }),
    analyzeReviews: vi.fn().mockResolvedValue({ id: "ai-3", status: "pending", analysis_type: "review" }),
    analyzeListingQuality: vi.fn().mockResolvedValue({ id: "ai-4", status: "completed", analysis_type: "listing_quality" }),
    listHistory: vi.fn().mockResolvedValue({ results: [] }),
  },
}));

describe("useProducts hook", () => {
  it("returns products list", async () => {
    const { useProducts } = await import("@/hooks/useProducts");
    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it("useCreateProduct returns mutation", async () => {
    const { useCreateProduct } = await import("@/hooks/useProducts");
    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it("useDeleteProduct returns mutation", async () => {
    const { useDeleteProduct } = await import("@/hooks/useProducts");
    const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

describe("useAITools hook", () => {
  it("useGenerateDescription returns mutation", async () => {
    const { useGenerateDescription } = await import("@/hooks/useAITools");
    const { result } = renderHook(() => useGenerateDescription(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it("useClassifyProduct returns mutation", async () => {
    const { useClassifyProduct } = await import("@/hooks/useAITools");
    const { result } = renderHook(() => useClassifyProduct(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it("useAnalyzeReviews returns mutation", async () => {
    const { useAnalyzeReviews } = await import("@/hooks/useAITools");
    const { result } = renderHook(() => useAnalyzeReviews(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

describe("useToast hook", () => {
  it("adds and removes toasts", async () => {
    const { useToast } = await import("@/hooks/useToast");
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toHaveLength(0);

    act(() => {
      result.current.toast.success("Test success", "All good!");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("success");
    expect(result.current.toasts[0].title).toBe("Test success");

    act(() => {
      result.current.removeToast(result.current.toasts[0].id);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("supports all toast types", async () => {
    const { useToast } = await import("@/hooks/useToast");
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast.error("Error msg");
      result.current.toast.warning("Warning msg");
      result.current.toast.info("Info msg");
    });

    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts.map((t) => t.type)).toEqual(["error", "warning", "info"]);
  });
});
