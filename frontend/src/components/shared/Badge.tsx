import { cn } from "@/utils";

type Variant = "default" | "success" | "warning" | "danger" | "info";

const variantMap: Record<Variant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-indigo-100 text-indigo-700",
};

interface BadgeProps {
  label: string;
  variant?: Variant;
  className?: string;
}

export function Badge({ label, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variantMap[variant], className)}>
      {label}
    </span>
  );
}
