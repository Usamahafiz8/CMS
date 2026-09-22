export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

// Dev builds never call registerServiceWorker (see _app.tsx), but a
// browser can still have one installed from an earlier prod-mode visit.
// Its cache-first `_next/static/*` handling then serves stale JS forever
// across dev restarts, since dev chunk names aren't content-hashed the
// way prod ones are. Remove it so dev always gets the live code.
export function unregisterServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });

  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
