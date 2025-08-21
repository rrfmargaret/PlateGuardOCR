import { useEffect } from "react";
import { CheckCircle, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
  autoClose?: boolean;
}

export default function ToastNotification({ 
  message, 
  type, 
  onClose, 
  autoClose = true 
}: ToastProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [onClose, autoClose]);

  const iconMap = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
  };

  const colorMap = {
    success: "border-secondary text-secondary",
    error: "border-error text-error",
    warning: "border-warning text-warning",
  };

  const Icon = iconMap[type];

  return (
    <div className="bg-surface border text-text-primary px-4 py-3 rounded-lg shadow-lg min-w-72 max-w-sm">
      <div className="flex items-center space-x-3">
        <Icon className={cn("w-5 h-5", colorMap[type])} />
        <span className="flex-1 text-sm">{message}</span>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
