"use client";
import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeToast } from "@/features/ui/store/uiSlice";
import { cn } from "@/shared/utils/cn";
import { Toast } from "../types/global.types";

export default function ToastContainer() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((s) => s.ui.toasts);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onRemove, 2800);
    return () => clearTimeout(t);
  }, [onRemove]);
  const icons = { success: CheckCircle, error: XCircle, info: Info };
  const colors = {
    success: "text-brand-sage",
    error: "text-brand-red",
    info: "text-brand-blue",
  };
  const Icon = icons[toast.type];
  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card shadow-card px-4 py-3 animate-slide-up pointer-events-auto",
      )}
    >
      <Icon size={16} className={colors[toast.type]} />
      <p className="flex-1 text-sm font-medium text-ink-1 dark:text-ink-dk1">
        {toast.message}
      </p>
      <button
        onClick={onRemove}
        className="text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
