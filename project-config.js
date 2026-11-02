export const CATEGORIES = [
  {id:'recent', label:'Recent'},
  {id:'art', label:'Art'},
  {id:'music-video', label:'Music Video'},
  {id:'docs', label:'Docs'},
  {id:'commercials', label:'Commercials'},
  {id:'cinema', label:'Cinema'}
];
export const PROJECT_CATEGORIES = CATEGORIES.filter(category => category.id !== 'recent');
export function projectsForCategory(projects, category) {
  const list = projects.filter(project => category === 'recent' || project.categories.includes(category));
  return list.sort((a,b) =>
    (a.order?.[category] ?? Number.MAX_SAFE_INTEGER) - (b.order?.[category] ?? Number.MAX_SAFE_INTEGER)
    || (category === 'recent' ? (b.year ?? -1) - (a.year ?? -1) : 0));
}
export function videoSource(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (!['https:','http:'].includes(url.protocol) || url.username || url.password) return null;
  const host = url.hostname.replace(/^www\./,'');
  const parts = url.pathname.split('/').filter(Boolean);
  let id;
  if (host === 'youtu.be') id = parts[0];
  if (['youtube.com','youtube-nocookie.com','m.youtube.com'].includes(host)) id = url.searchParams.get('v') || (['embed','shorts','live'].includes(parts[0]) ? parts[1] : null);
  if (id && /^[\w-]{11}$/.test(id)) return {kind:'embed',provider:'YouTube',src:`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`};
  if (['vimeo.com','player.vimeo.com'].includes(host)) {
    id = parts.find(part => /^\d+$/.test(part));
    if (id) {
      const hash = url.searchParams.get('h') || parts[parts.indexOf(id)+1];
      const embed = new URL(`https://player.vimeo.com/video/${id}`);
      embed.searchParams.set('autoplay','1');
      if (hash && /^[a-zA-Z0-9]+$/.test(hash)) embed.searchParams.set('h',hash);
      return {kind:'embed',provider:'Vimeo',src:embed.href};
    }
  }
  if (['vkvideo.ru','vk.com','m.vk.com'].includes(host)) {
    const match = url.pathname.match(/video(-?\d+)_(\d+)/);
    const owner = match?.[1] || url.searchParams.get('oid');
    const videoId = match?.[2] || url.searchParams.get('id');
    if (/^-?\d+$/.test(owner || '') && /^\d+$/.test(videoId || '')) {
      const embed = new URL('https://vk.com/video_ext.php');
      embed.searchParams.set('oid',owner); embed.searchParams.set('id',videoId); embed.searchParams.set('autoplay','1');
      if (url.searchParams.get('hash')) embed.searchParams.set('hash',url.searchParams.get('hash'));
      return {kind:'embed',provider:'VK Видео',src:embed.href};
    }
  }
  if (/\.(mp4|webm|ogv|mov)$/i.test(url.pathname)) return {kind:'file',provider:'Видео',src:url.href};
  return {kind:'external',provider:host,src:url.href};
}
