import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Package } from "lucide-react";

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    logout: vi.fn(),
    user: { email: "test@test.com", full_name: "Test User", role: "analyst" },
  }),
}));

// Mock authStore
vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (s: { user: null }) => null) => selector({ user: null }),
}));

describe("ConfirmDialog", () => {
  it("does not render when closed", () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when open", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Item"
        description="This cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Delete"
        description="Sure?"
        confirmLabel="Yes, Delete"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("Yes, Delete"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when cancel button clicked", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Delete"
        description="Sure?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows loading state when isLoading is true", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete"
        description="Sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isLoading={true}
      />
    );
    expect(screen.getByText("Processing…")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState icon={Package} title="No Products" description="Add your first product" />);
    expect(screen.getByText("No Products")).toBeInTheDocument();
    expect(screen.getByText("Add your first product")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        icon={Package}
        title="No items"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });
});

describe("LoadingSpinner", () => {
  it("renders spinning element", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});

describe("Sidebar", () => {
  it("renders all navigation links", () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("AI Tools")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });
});
