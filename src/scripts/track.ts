// Thin wrapper over the Meta Pixel. Safe when the pixel is blocked or not loaded.
declare global { interface Window { fbq?: (...a: unknown[]) => void } }
export function track(event: 'Lead' | 'Contact' | 'ViewContent', data: Record<string, unknown> = {}) {
  try { window.fbq?.('track', event, data); } catch { /* blocked */ }
}
// Any element with data-track="Contact" (WhatsApp / phone links) reports a Contact event on click.
document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
  if (el) track(el.dataset.track as 'Contact', { content_name: el.textContent?.trim().slice(0, 40) });
}, { capture: true });
