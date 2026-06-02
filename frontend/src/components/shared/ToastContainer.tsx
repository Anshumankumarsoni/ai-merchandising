import { cn } from "@/utils";
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "lucide-react";
import { Toast, ToastType } from "@/hooks/useToast";

const CONFIG: Record<ToastType, { icon: typeof CheckCircle; classes: string }> = {
  success: { icon: CheckCircle, classes: "bg-green-50 border-green-200 text-green-800" },
  error: { icon: AlertCircle, classes: "bg-red-50 border-red-200 text-red-800" },
  warning: { icon: AlertTriangle, classes: "bg-amber-50 border-amber-200 text-amber-800" },
  info: { icon: Info, classes: "bg-blue-50 border-blue-200 text-blue-800" },
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((toast) => {
        const { icon: Icon, classes } = CONFIG[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right",
              classes
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.message && <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
