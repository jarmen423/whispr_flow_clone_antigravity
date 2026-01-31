"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration Component
 * 
 * Registers the service worker for PWA functionality.
 * This runs on the client side only.
 */

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Only register in production or if explicitly enabled
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_ENABLE_SW) {
      console.log("[SW] Service worker disabled in development");
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Registered:", registration.scope);
          
          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[SW] New version available");
                  // Could show a "Update available" toast here
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("[SW] Registration failed:", error);
        });
    } else {
      console.log("[SW] Service workers not supported");
    }
  }, []);

  return null;
}
