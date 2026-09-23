import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  variant?: "success" | "error";
  onDismiss: () => void;
}

export default function Toast({ message, variant = "success", onDismiss }: ToastProps) {
  if (typeof document === "undefined") return null;

  const colors =
    variant === "success"
      ? "bg-green-50 text-green-800 border-green-200"
      : "bg-red-50 text-red-800 border-red-200";

  return createPortal(
    <div
      className={`animate-fade-in-up fixed inset-x-4 bottom-20 z-50 flex items-center justify-between gap-4 rounded-lg border px-4 py-3 shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-start ${colors}`}
      role="alert"
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-sm font-semibold opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>,
    document.body,
  );
}
