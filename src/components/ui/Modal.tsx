"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={cn(
        "fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border-0 bg-[var(--surface)] p-6 text-[var(--ink)] shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {open && (
        <>
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2
              id={titleId}
              className="min-w-0 break-words text-lg font-semibold"
            >
              {title}
            </h2>
            <Button
              type="button"
              className="shrink-0"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
          {children}
        </>
      )}
    </dialog>
  );
}
