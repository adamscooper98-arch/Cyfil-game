/**
 * Registers the service worker in built (non dev-server) bundles only.
 * Dev/test builds activate new versions immediately and reload once, so an installed dev PWA updates without reinstalling.
 * Prod keeps the cautious behavior (a new version waits) until the game has an in-game "update ready" prompt (D-021).
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  if (__DEV_TOOLS__ && navigator.serviceWorker.controller) {
    // Only reload on an update, not on the first install (where claim() also fires controllerchange).
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }

  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err: unknown) => {
    console.warn('Service worker registration failed', err);
  });
}
