import { useCallback, useState } from "react";

interface ToastState {
  message: string;
  variant: "success" | "error";
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, variant: ToastState["variant"] = "success") => {
    setToast({ message, variant });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast };
}
