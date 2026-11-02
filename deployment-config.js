// Cloudflare uses the same origin. The Pages build supplies the public API origin.
export const PUBLIC_BACKEND_ORIGIN = 'https://portfolio.racoome.workers.dev';

export function publicProjectsUrl(siteBase = new URL('./', import.meta.url), backend = PUBLIC_BACKEND_ORIGIN) {
  // A Pages release contains a matching list and all of its cover files.
  // Never expose a live edit before its uploaded cover has been published.
  return new URL(backend ? 'projects-snapshot.json' : 'api/projects', siteBase).href;
}

export function projectUrl(value, pageUrl, siteBase = new URL('./', import.meta.url), backend = PUBLIC_BACKEND_ORIGIN) {
  if (!value) return null;
  try {
    // Pages serves copies of uploaded covers, so viewing them does not depend
    // on reaching Cloudflare. Video previews retain their original source.
    const cover = /^\/media\/([a-f0-9-]+\.(?:jpg|png|webp))$/.exec(value);
    if (backend && cover) return new URL(`assets/project-media/${cover[1]}`, siteBase).href;
    const base = value.startsWith('/media/') && backend ? `${backend}/` : siteBase;
    const url = /^\/(?:media|assets)\//.test(value)
      ? new URL(value.slice(1), base)
      : new URL(value, pageUrl);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
