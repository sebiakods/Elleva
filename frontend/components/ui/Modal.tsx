"use client";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-wine-900/40 backdrop-blur-sm animate-rise"
        onClick={onClose}
      />
      <div className="card-surface relative z-10 w-full max-w-lg p-8 shadow-bloom animate-rise">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-ink-soft transition-colors hover:bg-sand-100 focus-ring"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
        {title && <h3 className="mb-4 font-display text-2xl text-ink">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

