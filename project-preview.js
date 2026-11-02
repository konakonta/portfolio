// Test the visible card itself, rather than searching neighbouring cards for a
// preview: a central project without a clip must keep its cover.
export function centeredProjectCard(cards, bounds) {
  const x = (bounds.left + bounds.right) / 2;
  const y = (bounds.top + bounds.bottom) / 2;
  return cards.find(card => {
    if (!card.isConnected) return false;
    const rect = card.getBoundingClientRect();
    return rect.left <= x && rect.right > x && rect.top <= y && rect.bottom > y;
  }) ?? null;
}

export function createProjectPreview({
  makeVideo = () => document.createElement('video'),
  setTimer = (callback, ms) => setTimeout(callback, ms),
  clearTimer = id => clearTimeout(id),
  requestFrame = callback => requestAnimationFrame(callback),
  cancelFrame = id => cancelAnimationFrame(id)
} = {}) {
  let current = null;
  function finish(session) {
    if (session.done) return;
    session.done = true;
    clearTimer(session.timer);
    cancelFrame(session.frame);
    if (!session.video) return;
    const video = session.video;
    video.pause();
    video.classList.remove('is-playing');
    // Keep the paused frame during the fade back to the cover, then release it.
    setTimer(() => { video.removeAttribute('src'); video.load(); video.remove(); }, 180);
    session.video = null;
  }
  function monitor(session) {
    session.frame = 0;
    if (session.done || current !== session) return;
    if (session.video.currentTime >= 10 || session.video.ended) finish(session);
    else session.frame = requestFrame(() => monitor(session));
  }
  function play(session) {
    session.timer = 0;
    if (session.done || current !== session || !session.card.isConnected) return;
    const video = session.video = makeVideo();
    video.className = 'project-video-preview';
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'none';
    video.tabIndex = -1;
    video.setAttribute('aria-hidden', 'true');
    video.addEventListener('playing', () => {
      if (session.done || current !== session) return;
      video.classList.add('is-playing');
      if (!session.frame) session.frame = requestFrame(() => monitor(session));
    });
    video.addEventListener('timeupdate', () => {
      if (!session.done && video.currentTime >= 10) finish(session);
    });
    video.addEventListener('ended', () => finish(session));
    video.addEventListener('error', () => finish(session));
    video.src = session.url;
    session.card.querySelector('.project-cover').append(video);
    video.play().catch(() => finish(session));
  }
  return {
    start(card, url, {immediate = false} = {}) {
      if (current?.card === card && current.url === url) return;
      this.stop();
      if (!card || !url) return;
      const session = current = {card, url, timer:0, frame:0, video:null, done:false};
      if (immediate) play(session);
      else session.timer = setTimer(() => play(session), 350);
    },
    stop() {
      if (current) finish(current);
      current = null;
    }
  };
}
