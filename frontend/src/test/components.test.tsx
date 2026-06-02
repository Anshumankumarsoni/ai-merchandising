import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/shared/Badge";
import { StatCard } from "@/components/shared/StatCard";
import { Package } from "lucide-react";

describe("Badge", () => {
  it("renders label text", () => {
    render(<Badge label="In Stock" />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("applies success variant classes", () => {
    const { container } = render(<Badge label="OK" variant="success" />);
    expect(container.firstChild).toHaveClass("bg-green-100", "text-green-700");
  });

  it("applies danger variant classes", () => {
    const { container } = render(<Badge label="Low" variant="danger" />);
    expect(container.firstChild).toHaveClass("bg-red-100", "text-red-700");
  });
});

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Total Products" value={42} icon={Package} />);
    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<StatCard title="Stock" value={5} icon={Package} subtitle="Low items" />);
    expect(screen.getByText("Low items")).toBeInTheDocument();
  });
});
