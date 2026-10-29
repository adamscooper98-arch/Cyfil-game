/** Registers the service worker in built (non dev-server) bundles only. */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err: unknown) => {
    console.warn('Service worker registration failed', err);
  });
}
