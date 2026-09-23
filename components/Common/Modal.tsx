import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-start sm:overflow-y-auto sm:p-4 sm:py-10">
      <div className="animate-fade-in-up flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white p-4 shadow-xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg sm:p-6">
        <div className="mb-3 flex justify-center sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-slate-200" />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto pb-[env(safe-area-inset-bottom)]">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
