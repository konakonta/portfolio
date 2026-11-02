function projectList(data) {
  if (!data || !Array.isArray(data.projects)) throw new Error('Invalid project response');
  return data.projects;
}

// The public snapshot and device cache keep the ribbon usable while the
// independent Cloudflare API is slow or unavailable. Only a live response
// updates the device cache; a late snapshot must never overwrite live edits.
export function startProjectLoading({apiUrl, snapshotUrl, onProjects, onUnavailable = () => {}, fetchImpl = globalThis.fetch, storage, timeoutMs = 6000}) {
  const cacheKey = `portfolio-projects:${apiUrl}`;
  let loaded = false;
  let liveLoaded = false;
  let snapshotFinished = false;
  let liveFinished = false;
  let pending = null;

  function show(list) { onProjects(list); loaded = true; }
  function unavailable() { if (!loaded && snapshotFinished && liveFinished) onUnavailable(); }
  async function read(url) {
    const controller = new AbortController();
    let timer;
    try {
      return await Promise.race([
        (async () => {
          const response = await fetchImpl(url, {cache:'no-store', credentials:'omit', signal:controller.signal});
          if (!response.ok) throw new Error(`Projects: ${response.status}`);
          return projectList(await response.json());
        })(),
        new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Project request timed out')); }, timeoutMs); }),
      ]);
    } finally { clearTimeout(timer); }
  }

  try {
    const cached = storage?.getItem(cacheKey);
    if (cached) show(projectList(JSON.parse(cached)));
  } catch { /* Storage may be disabled or contain an outdated value. */ }

  const snapshot = read(snapshotUrl).then(list => {
    if (!loaded && !liveLoaded) show(list);
  }).catch(() => {}).finally(() => { snapshotFinished = true; unavailable(); });

  function refresh() {
    if (pending) return pending;
    pending = read(apiUrl).then(list => {
      liveLoaded = true;
      show(list);
      try { storage?.setItem(cacheKey, JSON.stringify({projects:list})); } catch {}
    }).catch(() => {}).finally(() => { liveFinished = true; pending = null; unavailable(); });
    return pending;
  }
  const live = refresh();
  return {refresh, ready:Promise.all([snapshot, live])};
}
