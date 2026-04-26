"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

type ToastContextValue = {
  toast: (message: string, tone?: Toast["tone"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, tone }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 3000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const tones: Record<Toast["tone"], string> = {
    success: "border-accent/40 text-accent",
    error: "border-danger/40 text-danger",
    info: "border-border text-ink",
  };
  return (
    <div
      className={`pointer-events-auto rounded-md border ${tones[toast.tone]} bg-surface px-4 py-2 text-sm font-mono shadow-lg transition-all duration-200 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {toast.message}
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
