"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
};

type ToastContextValue = {
  toast: (t: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = uid();
    const duration = t.durationMs ?? 2500;

    setToasts((prev) => [...prev, { ...t, id }]);

    window.setTimeout(() => {
      remove(id);
    }, duration);
  }, [remove]);

  const api = useMemo<ToastContextValue>(() => ({
    toast: push,
    success: (title, message) => push({ type: "success", title, message }),
    error: (title, message) => push({ type: "error", title, message, durationMs: 3200 }),
    info: (title, message) => push({ type: "info", title, message }),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast viewport */}
      <div className="fixed right-4 top-4 z-[9999] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => {
          const accent =
            t.type === "success"
              ? "border-green-200 bg-green-50 text-green-900"
              : t.type === "error"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-gray-200 bg-white text-gray-900";

          return (
            <div
              key={t.id}
              className={`rounded-2xl border px-4 py-3 shadow-lg ${accent}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{t.title}</div>
                  {t.message ? (
                    <div className="mt-0.5 text-sm opacity-80">{t.message}</div>
                  ) : null}
                </div>

                <button
                  onClick={() => remove(t.id)}
                  className="rounded-xl p-1 hover:bg-black/5"
                  aria-label="Close toast"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
