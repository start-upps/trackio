// src/components/providers/ToastProvider.tsx
"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "rgb(31 41 55)",
          color: "#fff",
          border: "1px solid rgb(55 65 81)",
        },
      }}
    />
  );
}
