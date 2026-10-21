"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { AppIcon } from "./AppIcon";

export type ToastTone = "success" | "info" | "danger";

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<((toast: ToastOptions) => void) | null>(null);

const TONE_ICON: Record<ToastTone, { icon: string; className: string }> = {
  success: { icon: "check-circle-bold", className: "text-success-soft" },
  info: { icon: "info-circle-linear", className: "text-white/70" },
  danger: { icon: "danger-circle-linear", className: "text-danger-soft" },
};

function ToastView({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const tone = TONE_ICON[toast.tone ?? "success"];

  useEffect(() => {
    const ms = toast.duration ?? (toast.action ? 6000 : 4000);
    const timer = window.setTimeout(() => onDismiss(toast.id), ms);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="pointer-events-auto flex items-center gap-3 pl-4 pr-2 py-2 min-h-11 rounded-2xl bg-ink text-white shadow-elevated max-w-[calc(100vw-2rem)]"
    >
      <AppIcon name={tone.icon} className={cn("w-4 h-4 shrink-0", tone.className)} />
      <span className="text-sm leading-snug">{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
          className="ml-1 shrink-0 px-2.5 py-1 rounded-lg text-sm font-semibold text-white underline-offset-2 hover:bg-white/10 cursor-pointer"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
      >
        <AppIcon name="close-circle-linear" className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(1);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((toast: ToastOptions) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {mounted &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none"
          >
            <AnimatePresence initial={false}>
              {toasts.map((t) => (
                <ToastView key={t.id} toast={t} onDismiss={dismiss} />
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  return useCallback((toast: ToastOptions) => show?.(toast), [show]);
}
