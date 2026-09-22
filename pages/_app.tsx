import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerServiceWorker, unregisterServiceWorker } from "@/lib/pwa";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  useEffect(() => {
    // Registering in dev makes the service worker cache-first-serve
    // `_next/static/*` chunks, which then never invalidate across dev
    // server restarts (unlike production, where each build gets new
    // content-hashed filenames) — causing stale-JS hydration mismatches.
    if (process.env.NODE_ENV === "production") {
      registerServiceWorker();
    } else {
      unregisterServiceWorker();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
