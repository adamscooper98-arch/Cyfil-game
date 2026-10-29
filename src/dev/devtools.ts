/** Dev-only tools. This module must never appear in the prod bundle (scripts/check-prod-bundle.ts greps for the marker). */
export const DEV_TOOLS_MARKER = 'CYFIL_DEV_TOOLS_MARKER';

export function initDevTools(): void {
  const badge = document.createElement('div');
  badge.className = 'dev-badge';
  badge.dataset.marker = DEV_TOOLS_MARKER;
  badge.textContent = `DEV ${__APP_ENV__} ${__COMMIT__}`;
  document.body.append(badge);
}
