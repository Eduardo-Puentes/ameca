"use client";

import { create } from "zustand";
import { cn } from "@/lib/utils";

export type ToastTone = "info" | "success" | "warning" | "danger";

export type ToastItem = {
  id: string;
  title: string;
  message?: string;
  tone?: ToastTone;
};

type ToastState = {
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, 3200);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

const toneClasses: Record<ToastTone, string> = {
  info: "border-[var(--info)] bg-[var(--info-soft)]",
  success: "border-[var(--success)] bg-[var(--success-soft)]",
  warning: "border-[var(--warning)] bg-[var(--warning-soft)]",
  danger: "border-[var(--danger)] bg-[var(--danger-soft)]",
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[320px] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg",
            toneClasses[toast.tone ?? "info"]
          )}
          onClick={() => dismissToast(toast.id)}
        >
          <div className="font-semibold text-[var(--ink)]">{toast.title}</div>
          {toast.message ? (
            <div className="mt-1 text-[var(--muted)]">{toast.message}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
