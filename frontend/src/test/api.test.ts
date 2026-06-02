import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock axios before importing client
vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        defaults: { headers: { common: {} } },
      })),
      post: vi.fn(),
    },
  };
});

describe("Auth store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("setAuth stores tokens in localStorage", async () => {
    const { useAuthStore } = await import("@/store/authStore");
    const store = useAuthStore.getState();
    const mockUser = { id: "1", email: "a@b.com", username: "ab", first_name: "", last_name: "", full_name: "AB", role: "analyst" as const, created_at: "" };

    store.setAuth(mockUser, "access-token", "refresh-token");

    expect(localStorage.getItem("access_token")).toBe("access-token");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-token");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe("a@b.com");
  });

  it("clearAuth removes tokens and resets state", async () => {
    const { useAuthStore } = await import("@/store/authStore");
    const store = useAuthStore.getState();
    const mockUser = { id: "2", email: "c@d.com", username: "cd", first_name: "", last_name: "", full_name: "CD", role: "manager" as const, created_at: "" };

    store.setAuth(mockUser, "some-access", "some-refresh");
    store.clearAuth();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe("utils", () => {
  it("formatCurrency formats USD correctly", async () => {
    const { formatCurrency } = await import("@/utils");
    expect(formatCurrency(99.99)).toBe("$99.99");
    expect(formatCurrency("1000")).toBe("$1,000.00");
  });

  it("capitalize uppercases first letter", async () => {
    const { capitalize } = await import("@/utils");
    expect(capitalize("amazon")).toBe("Amazon");
    expect(capitalize("EBAY")).toBe("EBAY");
  });
});
