import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Login from "@/pages/Login";

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isLoggingIn: false,
    isRegistering: false,
    loginError: null,
    user: null,
    isAuthenticated: false,
  }),
}));

// Mock react-router-dom navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Login Page", () => {
  it("renders login form", () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("has a link to register", () => {
    renderWithProviders(<Login />);
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("shows app title", () => {
    renderWithProviders(<Login />);
    expect(screen.getByText("AI Merchandising Assistant")).toBeInTheDocument();
  });

  it("allows typing in email field", async () => {
    renderWithProviders(<Login />);
    const emailInput = screen.getByPlaceholderText("you@company.com");
    await userEvent.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("allows typing in password field", async () => {
    renderWithProviders(<Login />);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    await userEvent.type(passwordInput, "mypassword");
    expect(passwordInput).toHaveValue("mypassword");
  });
});

describe("Register Page", () => {
  it("renders registration form fields", async () => {
    const Register = (await import("@/pages/Register")).default;
    renderWithProviders(<Register />);
    expect(screen.getByPlaceholderText("janesmith")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("jane@company.com")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument();
  });

  it("shows password mismatch error", async () => {
    const Register = (await import("@/pages/Register")).default;
    renderWithProviders(<Register />);

    await userEvent.type(screen.getByPlaceholderText("janesmith"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("jane@company.com"), "test@test.com");
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "password1");
    await userEvent.type(screen.getByPlaceholderText("Repeat password"), "password2");

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });
  });
});
