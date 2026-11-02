// Cloudflare uses the same origin. The Pages build supplies the public API origin.
export const PUBLIC_BACKEND_ORIGIN = 'https://portfolio.racoome.workers.dev';

export function publicProjectsUrl(siteBase = new URL('./', import.meta.url), backend = PUBLIC_BACKEND_ORIGIN) {
  return new URL('api/projects', backend ? `${backend}/` : siteBase).href;
}

export function projectUrl(value, pageUrl, siteBase = new URL('./', import.meta.url), backend = PUBLIC_BACKEND_ORIGIN) {
  if (!value) return null;
  try {
    const base = value.startsWith('/media/') && backend ? `${backend}/` : siteBase;
    const url = /^\/(?:media|assets)\//.test(value)
      ? new URL(value.slice(1), base)
      : new URL(value, pageUrl);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
