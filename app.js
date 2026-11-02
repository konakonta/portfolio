import {CATEGORIES,videoSource} from './project-config.js?v=89652b9ea833';
import {createProjectPreview,centeredProjectCard} from './project-preview.js?v=89652b9ea833';
import {createPortfolioBackground} from './portfolio-background.js?v=89652b9ea833';
import {createAlbumPlayer} from './album-player.js?v=89652b9ea833';
import {publicProjectsUrl,projectUrl} from './deployment-config.js?v=89652b9ea833';
import {startProjectLoading} from './project-loader.js?v=89652b9ea833';
import {mobileRowGeometry,swipeStep,projectRibbon,middleRibbonIndex,desktopRowGeometry} from './project-navigation.js?v=89652b9ea833';

const root = document.querySelector('.portfolio');
const viewport = document.querySelector('.projects-viewport');
const track = document.querySelector('.projects-track');
const trigger = document.querySelector('.menu-trigger');
const options = document.querySelector('.menu-options');
const label = document.querySelector('#category-label');
const dialog = document.querySelector('.video-dialog');
const video = dialog.querySelector('video');
const videoFrame = dialog.querySelector('iframe');
const logo = document.querySelector('.site-logo');
const aboutCopy = document.querySelector('.about-copy');
const mobile = matchMedia('(max-width: 767px)');
const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const projectPreview = createProjectPreview();
const background = createPortfolioBackground(document.querySelector('.background'), mobile);
const album = createAlbumPlayer(root,document.querySelector('.album-player'),document.querySelector('#album-audio'),mobile,{onStart:()=>projectPreview.stop(),status:document.querySelector('#album-status')});
const sections = [...CATEGORIES, {id:'about', label:'About'}];
let logoHovered = false;
let logoFocused = false;
let aboutOpening = false;
let previewWindowActive = true;
let category = 'about';
let menuOpen = false;
let changing = false;
let projects = [];
let ribbon = {items:[], cycleLength:0, starts:{}};
let desktopJump = null;
let labelTimer = 0;
let requestedLabel = label.textContent;
let gesture = null;
let suppressClickUntil = 0;
let lastWheel = 0;
let wheelTotal = 0;
let wheelCommitted = false;
let wheelAxis = '';
let wheelDirection = 0;
let frame = 0;
let mobilePosition = 0;
let mobileOverscroll = 0;
let mobileSlideFrame = 0;
let sectionFrame = 0;
let sectionResolve = null;
let sectionOffset = 0;
let sectionOpacity = 1;
const startTime = performance.now();
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function syncSiteView() {
  const preview = category !== 'about' && !menuOpen && !changing && !dialog.open && !mobile.matches && hoverPointer.matches && (logoHovered || logoFocused);
  const showAbout = category === 'about' || preview || aboutOpening;
  root.classList.toggle('about-view', showAbout);
  root.classList.toggle('logo-preview', preview);
  aboutCopy.setAttribute('aria-hidden', String(!showAbout));
  viewport.setAttribute('aria-hidden', String(preview));
  viewport.tabIndex = preview ? -1 : 0;
  track.inert = preview;
  background.set(category, showAbout);
  album.setView(category==='about',menuOpen || changing || dialog.open,showAbout);
  if (showAbout) { hideFollower(); projectPreview.stop(); if (preview) cancelGesture(); resetCardTilt(); }
}
logo.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { logoHovered = true; syncSiteView(); } });
logo.addEventListener('pointerleave', () => { logoHovered = false; syncSiteView(); });
logo.addEventListener('focus', () => { logoFocused = logo.matches(':focus-visible'); syncSiteView(); });
logo.addEventListener('blur', () => { logoFocused = false; syncSiteView(); });
logo.addEventListener('click', () => switchCategory('about'));
mobile.addEventListener('change', () => { logoHovered = logoFocused = false; syncSiteView(); });
hoverPointer.addEventListener('change', syncSiteView);

function tick() {
  const total = Math.floor((performance.now() - startTime) / 1000);
  document.querySelector('#timer').textContent = [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60].map(value => String(value).padStart(2, '0')).join(':');
}
tick();
setInterval(tick, 250);

function setMenu(open) {
  if (open) { hideFollower(); cancelGesture(); resetCardTilt(); projectPreview.stop(); }
  menuOpen = open;
  root.classList.toggle('menu-open', open);
  trigger.setAttribute('aria-expanded', String(open));
  options.inert = !open;
  syncSiteView();
  scheduleLayout();
}
trigger.addEventListener('click', () => setMenu(!menuOpen));
document.querySelector('.menu-overlay').addEventListener('click', () => setMenu(false));
function renderMenu() {
  options.replaceChildren();
  for (const item of sections.filter(item=>item.id!==category)) {
    const button=document.createElement('button');button.className='menu-pill menu-option';button.textContent=item.label;button.dataset.category=item.id;button.addEventListener('click',()=>switchCategory(item.id));options.append(button);
  }
  [...options.children].forEach((button,i)=>button.style.transitionDelay=`${(options.children.length-i-1)*20}ms`);
}
function changeCategoryLabel(text) {
  trigger.setAttribute('aria-label', text);
  if (requestedLabel === text) return;
  requestedLabel = text;
  clearTimeout(labelTimer);
  if (reducedMotion.matches) {
    label.textContent = text;
    label.classList.remove('is-changing');
    return;
  }
  label.classList.add('is-changing');
  labelTimer = setTimeout(() => {
    label.textContent = requestedLabel;
    label.classList.remove('is-changing');
    labelTimer = 0;
  }, 180);
}
function applyCategory(next) {
  category = next;
  const title = sections.find(item => item.id === next).label;
  changeCategoryLabel(title);
  root.dataset.category = next;
  renderMenu();
  viewport.setAttribute('aria-label', `Проекты ${title}`);
  document.title = 'portfolio';
  document.querySelector('#category-announcement').textContent = `Категория ${title}`;
  syncSiteView();
}
function syncRibbonCategory(index) {
  const item = ribbon.items[index];
  if (!item || changing || menuOpen || dialog.open) return;
  if (item.category !== category) applyCategory(item.category);
  root.dataset.category = category;
  root.dataset.projectIndex = String(item.projectIndex);
  root.dataset.ribbonIndex = String(index);
}
function stepCategory(direction) {
  const index=sections.findIndex(item=>item.id===category);
  switchCategory(sections[(index+direction+sections.length)%sections.length].id, mobile.matches ? direction : 0);
}
renderMenu();
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuOpen) { setMenu(false); trigger.focus(); }
  if (event.key === 'Escape' && root.classList.contains('logo-preview')) { logoHovered = logoFocused = false; syncSiteView(); return; }
  if (menuOpen || dialog.open || event.target.closest('button,a')) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    stepCategory(event.key === 'ArrowDown' ? 1 : -1);
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    if (mobile.matches) settleMobileProject(Math.round(mobilePosition) + direction);
    else viewport.scrollBy({left: direction * viewport.clientWidth * .6, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }
});
root.addEventListener('focusout', () => {
  requestAnimationFrame(() => { if (menuOpen && !document.querySelector('.menu').contains(document.activeElement)) setMenu(false); });
});

function caption(project) {
  const el = document.createElement('span');
  el.className = 'project-caption';
  const name = document.createElement('span');
  name.className = 'project-name';
  name.textContent = project.name;
  const year = document.createElement('span');
  year.className = 'project-year';
  year.textContent = project.year ?? '';
  el.append(name);
  if (project.year) el.append(year);
  return el;
}

// One overlay keeps its position when the pointer crosses cards or their gaps.
const follower = document.createElement('span');
follower.className = 'project-follower';
follower.setAttribute('aria-hidden', 'true');
const followerPlay = document.createElement('span');
followerPlay.className = 'follower-play';
followerPlay.innerHTML = '<span class="play"><svg viewBox="0 0 40 40"><path d="M7 3 36 20 7 37Z" fill="currentColor"/></svg></span>';
const followerCaption = document.createElement('span');
followerCaption.className = 'follower-caption';
const captionLayers = [0, 1].map(() => {
  const layer = document.createElement('span');
  layer.className = 'follower-caption-layer';
  followerCaption.append(layer);
  return layer;
});
follower.append(followerPlay, followerCaption);
root.append(follower);
let followerProject = null;
let captionLayer = 0;
let followerX = 0;
let followerY = 0;
let targetX = 0;
let targetY = 0;
let followerFrame = 0;
let followerTime = 0;
let followerVisible = false;
let followerHiddenAt = -Infinity;
let hideFollowerTimer = 0;

function moveFollower(time) {
  const dt = followerTime ? Math.min(time - followerTime, 64) : 16;
  followerTime = time;
  // Time-based damping avoids restarting CSS transitions on every pointer event.
  const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-dt / 95);
  followerX += (targetX - followerX) * blend;
  followerY += (targetY - followerY) * blend;
  follower.style.transform = `translate3d(${followerX}px,${followerY}px,0)`;
  if (Math.hypot(targetX - followerX, targetY - followerY) > .1) {
    followerFrame = requestAnimationFrame(moveFollower);
  } else {
    followerFrame = 0;
    followerTime = 0;
  }
}
function scheduleFollower() {
  if (!followerFrame) followerFrame = requestAnimationFrame(moveFollower);
}
function hideFollower() {
  clearTimeout(hideFollowerTimer);
  hideFollowerTimer = 0;
  if (followerVisible) followerHiddenAt = performance.now();
  followerVisible = false;
  follower.classList.remove('is-visible');
}
function leaveFollower() {
  if (!hideFollowerTimer) hideFollowerTimer = setTimeout(hideFollower, 100);
}
function followPointer(event) {
  if (mobile.matches || !hoverPointer.matches || event.pointerType === 'touch' || event.buttons || menuOpen || changing || dialog.open || root.classList.contains('about-view')) return;
  targetX = event.clientX + 24;
  targetY = event.clientY + 24;
  const card = event.target.closest('.project');
  if (!card) {
    if (followerVisible) { scheduleFollower(); leaveFollower(); }
    return;
  }
  clearTimeout(hideFollowerTimer);
  hideFollowerTimer = 0;
  const project = projects.find(project => project.id === card.dataset.id);
  if (!project) return;
  if (followerProject !== project.id) {
    const nextLayer = followerProject === null ? captionLayer : 1 - captionLayer;
    captionLayers[nextLayer].replaceChildren(caption(project));
    captionLayers[captionLayer].classList.remove('is-current');
    captionLayers[nextLayer].classList.add('is-current');
    followerCaption.style.width = `${captionLayers[nextLayer].offsetWidth}px`;
    captionLayer = nextLayer;
    follower.classList.toggle('is-video', project.type === 'video');
    followerProject = project.id;
  }
  if (!followerVisible && performance.now() - followerHiddenAt > 220) {
    followerX = targetX;
    followerY = targetY;
    follower.style.transform = `translate3d(${followerX}px,${followerY}px,0)`;
  }
  followerVisible = true;
  follower.classList.add('is-visible');
  scheduleFollower();
}
viewport.addEventListener('pointermove', followPointer);
viewport.addEventListener('pointerenter', followPointer);
viewport.addEventListener('pointerleave', leaveFollower);
window.addEventListener('blur', hideFollower);
window.addEventListener('resize', hideFollower);
mobile.addEventListener('change', hideFollower);

function startCardPreview(card, immediate = false) {
  const project = projects.find(project => project.id === card?.dataset.id);
  const url = project?.type === 'video' && !reducedMotion.matches ? safeUrl(project.preview) : null;
  if (url) projectPreview.start(card, url, {immediate});
  else projectPreview.stop();
}
function syncMobilePreview() {
  if (!mobile.matches) return;
  if (menuOpen || changing || dialog.open || document.hidden || !previewWindowActive || mobileSlideFrame || ['horizontal','vertical'].includes(gesture?.axis)) {
    projectPreview.stop();
    return;
  }
  const index = Math.round(mobilePosition);
  const card = centeredProjectCard([...track.children].slice(Math.max(0,index-1),index+2), viewport.getBoundingClientRect());
  startCardPreview(card);
}
function hoverCardPreview(event) {
  if (mobile.matches || !hoverPointer.matches || event.pointerType === 'touch' || event.buttons || gesture || menuOpen || changing || dialog.open || root.classList.contains('about-view')) return;
  startCardPreview(event.target.closest('.project'));
}
viewport.addEventListener('pointermove', hoverCardPreview);
viewport.addEventListener('pointerenter', hoverCardPreview);
viewport.addEventListener('pointerleave', () => { if (!mobile.matches) projectPreview.stop(); });

// Rotate the inner surface; the outer card stays still for hit testing and layout.
const tiltedCards = new Map();
let tiltFrame = 0;
let tiltTime = 0;
const clampTilt = value => Math.max(-1, Math.min(1, value));
function animateCardTilt(time) {
  const dt = tiltTime ? Math.min(time - tiltTime, 64) : 16;
  tiltTime = time;
  let moving = false;
  for (const [card, state] of tiltedCards) {
    const returning = state.targetX === 0 && state.targetY === 0;
    const blend = 1 - Math.exp(-dt / (returning ? 150 : 90));
    state.x += (state.targetX - state.x) * blend;
    state.y += (state.targetY - state.y) * blend;
    const settled = Math.max(Math.abs(state.targetX - state.x), Math.abs(state.targetY - state.y)) < .005;
    if (settled && returning) {
      state.surface.style.removeProperty('transform');
      card.classList.remove('is-tilting');
      tiltedCards.delete(card);
      continue;
    }
    if (settled) { state.x = state.targetX; state.y = state.targetY; }
    state.surface.style.transform = `perspective(1000px) rotateX(${state.x}deg) rotateY(${state.y}deg)`;
    if (!settled) moving = true;
  }
  tiltFrame = moving ? requestAnimationFrame(animateCardTilt) : 0;
  if (!moving) tiltTime = 0;
}
function scheduleCardTilt() {
  if (!tiltFrame) tiltFrame = requestAnimationFrame(animateCardTilt);
}
function resetCardTilt(immediate = false) {
  for (const [card, state] of tiltedCards) {
    state.targetX = state.targetY = 0;
    if (immediate) {
      state.surface.style.removeProperty('transform');
      card.classList.remove('is-tilting');
    }
  }
  if (immediate) {
    cancelAnimationFrame(tiltFrame);
    tiltFrame = tiltTime = 0;
    tiltedCards.clear();
  } else if (tiltedCards.size) scheduleCardTilt();
}
function tiltCard(card, clientX, clientY, maxAngle) {
  if (reducedMotion.matches) return;
  for (const [other, state] of tiltedCards) {
    if (other !== card) state.targetX = state.targetY = 0;
  }
  let state = tiltedCards.get(card);
  if (!state) {
    state = {surface:card.querySelector('.project-surface'), x:0, y:0, targetX:0, targetY:0};
    tiltedCards.set(card, state);
    card.classList.add('is-tilting');
  }
  const bounds = card.getBoundingClientRect();
  // The edge nearest the pointer moves slightly away from the viewer.
  state.targetX = -clampTilt((clientY - bounds.top) / bounds.height * 2 - 1) * maxAngle;
  state.targetY = clampTilt((clientX - bounds.left) / bounds.width * 2 - 1) * maxAngle;
  scheduleCardTilt();
}
function hoverCardTilt(event) {
  if (mobile.matches || !hoverPointer.matches || event.pointerType === 'touch' || event.buttons || gesture || menuOpen || changing || dialog.open || root.classList.contains('about-view')) return;
  const card = event.target.closest('.project');
  if (card) tiltCard(card, event.clientX, event.clientY, 3);
  else resetCardTilt();
}
viewport.addEventListener('pointermove', hoverCardTilt);
viewport.addEventListener('pointerenter', hoverCardTilt);
viewport.addEventListener('pointerleave', () => {
  if (gesture?.axis !== 'tilt') resetCardTilt();
});
function resetCardInteraction() { cancelGesture(); stopMobileSlide(); mobilePosition = Math.round(mobilePosition); mobileOverscroll = 0; resetCardTilt(reducedMotion.matches); projectPreview.stop(); scheduleLayout(); }
window.addEventListener('blur', () => { previewWindowActive = false; logoHovered = logoFocused = false; syncSiteView(); resetCardInteraction(); });
window.addEventListener('focus', () => { previewWindowActive = true; scheduleLayout(); });
let interactionWidth = viewport.clientWidth;
window.addEventListener('resize', () => {
  // Safari's address bar changes the viewport height during a touch gesture.
  // Only a width change (rotation/resizing) should cancel the gesture.
  if (interactionWidth !== viewport.clientWidth) resetCardInteraction();
  interactionWidth = viewport.clientWidth;
});
mobile.addEventListener('change', resetCardInteraction);
hoverPointer.addEventListener('change', resetCardInteraction);
reducedMotion.addEventListener('change', resetCardInteraction);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetCardInteraction(); else scheduleLayout(); });

function safeUrl(value) {
  return projectUrl(value,location.href);
}
function render() {
  hideFollower();
  projectPreview.stop();
  cancelGesture();
  resetCardTilt(true);
  stopMobileSlide();
  ribbon = projectRibbon(projects, sections);
  mobilePosition = ribbon.starts[category] ?? ribbon.cycleLength;
  desktopJump = mobilePosition;
  mobileOverscroll = 0;
  track.replaceChildren();
  for (const [index, item] of ribbon.items.entries()) {
    if (item.kind !== 'project') {
      const page = document.createElement('span');
      page.className = 'ribbon-page';
      page.dataset.category = item.category;
      page.dataset.kind = item.kind;
      page.dataset.ribbonIndex = String(index);
      page.setAttribute('aria-hidden', 'true');
      const drum = document.createElement('span');
      drum.className = 'project-drum';
      page.append(drum);
      track.append(page);
      continue;
    }
    const {project} = item;
    const url = safeUrl(project.url);
    const source = project.type==='video' ? videoSource(url) : null;
    const external = project.type==='website' || source?.kind==='external';
    const card = document.createElement(external && url ? 'a' : 'button');
    card.className = `project ${project.coverFormat === 'landscape' ? 'landscape' : 'poster'}`;
    card.draggable = false;
    card.dataset.id = project.id;
    card.dataset.category = item.category;
    card.dataset.kind = 'project';
    card.dataset.ribbonIndex = String(index);
    card.setAttribute('aria-label', `${project.name}${project.year ? `, ${project.year}` : ''}${url ? '' : ', ссылка пока не добавлена'}`);
    if (card.tagName === 'A') { card.href = url; card.target = '_blank'; card.rel = 'noopener noreferrer'; }
    const cover = document.createElement('span');
    cover.className = 'project-cover';
    if (safeUrl(project.cover)) {
      const img = document.createElement('img');
      img.src = safeUrl(project.cover); img.alt = ''; img.draggable = false;
      img.loading=Math.abs(index-mobilePosition)<2?'eager':'lazy';img.decoding='async';
      cover.append(img);
    }
    const hover = document.createElement('span');
    hover.className = 'project-hover';
    if (project.type === 'video') {
      const play = document.createElement('span');
      play.className = 'play';
      play.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M7 3 36 20 7 37Z" fill="currentColor"/></svg>';
      hover.append(play);
    }
    hover.append(caption(project));
    const surface = document.createElement('span');
    surface.className = 'project-surface';
    surface.append(cover, caption(project), hover);
    const drum = document.createElement('span');
    drum.className = 'project-drum';
    drum.append(surface);
    card.append(drum);
    card.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil || !url) { event.preventDefault(); return; }
      projectPreview.stop();
      if (project.type === 'video') {
        if(external) return;
        if(!source) return;
        hideFollower();
        cancelGesture();
        resetCardTilt();
        video.hidden=source.kind!=='file';videoFrame.hidden=source.kind!=='embed';
        dialog.setAttribute('aria-label',project.name);
        if(source.kind==='file')video.src=source.src;
        else {videoFrame.src=source.src;videoFrame.title=project.name;}
        dialog.showModal();
        syncSiteView();
        if(source.kind==='file')video.play().catch(() => {});
      }
    });
    track.append(card);
  }
  viewport.scrollLeft = 0;
  scheduleLayout();
}
async function switchCategory(next, direction = 0) {
  const keepAbout = next === 'about' && root.classList.contains('about-view');
  const wasMenuOpen=menuOpen;
  setMenu(false);
  if (category === next || changing) return;
  changing = true;
  root.classList.add('category-changing');
  aboutOpening = keepAbout;
  logoHovered = logoFocused = false;
  syncSiteView();
  hideFollower();
  projectPreview.stop();
  cancelGesture();
  resetCardTilt();
  track.classList.add('changing');
  const swipe = mobile.matches && direction && !reducedMotion.matches;
  if (swipe) await animateSection(-direction * Math.max(110, Math.abs(sectionOffset) + 24), 0, 140);
  else { resetSectionMotion(); await wait(reducedMotion.matches ? 0 : wasMenuOpen ? 350 : 220); }
  applyCategory(next);
  render();
  syncSiteView();
  if (swipe) {
    setSectionMotion(direction * 64, 0);
    track.classList.remove('changing');
    await animateSection(0, 1, 220);
    resetSectionMotion();
  } else {
    await wait(30);
    track.classList.remove('changing');
    await wait(reducedMotion.matches ? 0 : 350);
  }
  changing = false;
  root.classList.remove('category-changing');
  aboutOpening = false;
  syncSiteView();
  scheduleLayout();
}

function layout() {
  frame = 0;
  const cards = [...track.children];
  if (!cards.length) return;
  if (!mobile.matches) {
    for (const card of cards) card.style.removeProperty('--mobile-width');
    track.style.removeProperty('transform');
    track.style.removeProperty('padding-right');
  }
  const width = viewport.clientWidth;
  const trackStyle = getComputedStyle(track);
  const gutter = parseFloat(trackStyle.paddingLeft);
  const gap = parseFloat(trackStyle.columnGap);
  const formats = ribbon.items.map(item => item.kind === 'project' ? item.project.coverFormat : item.kind);
  if (mobile.matches) {
    desktopJump = null;
    if (viewport.scrollLeft) viewport.scrollLeft = 0;
    if (!gesture && !mobileSlideFrame) centerMobileRibbon();
    const actualPoster = cards.find(card => card.classList.contains('poster'));
    const measuredPosterWidth = actualPoster ? parseFloat(getComputedStyle(actualPoster.querySelector('.project-drum')).width) : Math.min(244, width * 244 / 390);
    const row = mobileRowGeometry(formats, mobilePosition, {width, posterWidth:measuredPosterWidth, gap, gutter, reducedMotion:reducedMotion.matches});
    cards.forEach((card, index) => {
      const cardWidth = `${row.cards[index].width}px`;
      const scale = String(row.cards[index].scale);
      if (card.classList.contains('landscape') && card.style.getPropertyValue('--mobile-width') !== cardWidth) card.style.setProperty('--mobile-width', cardWidth);
      if (card.style.getPropertyValue('--drum-scale') !== scale) card.style.setProperty('--drum-scale', scale);
    });
    track.style.transform = `translate3d(${-row.offset - mobileOverscroll}px,-50%,0)`;
    track.style.removeProperty('padding-right');
    syncRibbonCategory(Math.round(mobilePosition));
    positionAboutCopy(row.cards, Math.round(mobilePosition), width);
    for (const [index, card] of cards.entries()) {
      if (row.cards[index].left > width || row.cards[index].left + row.cards[index].width * row.cards[index].scale < 0) continue;
      const name = card.querySelector('.project-surface > .project-caption .project-name');
      if (name) name.classList.toggle('is-truncated', name.scrollWidth > name.clientWidth + 1);
    }
    syncMobilePreview();
    return;
  }
  // Measure unscaled widths together, then compute the row in one pass. Using
  // the previous stretched DOM positions would create a feedback loop on scroll.
  const poster = cards.find(card => card.classList.contains('poster'));
  const landscape = cards.find(card => card.classList.contains('landscape'));
  const posterWidth = poster ? parseFloat(getComputedStyle(poster.querySelector('.project-drum')).width) : 0;
  const landscapeWidth = landscape ? parseFloat(getComputedStyle(landscape.querySelector('.project-drum')).width) : 0;
  const widths = formats.map(format => format === 'landscape' ? landscapeWidth : ['about','empty'].includes(format) ? width : posterWidth);
  const pages = ribbon.items.map(item => item.kind !== 'project');
  const settings = {width, gutter, gap, pages, reducedMotion:reducedMotion.matches};
  const before = index => widths.slice(0, index).reduce((sum, value) => sum + value + gap, 0);
  if (desktopJump !== null) {
    const index = desktopJump;
    desktopJump = null;
    viewport.scrollLeft = before(index) + (pages[index] ? gutter : 0);
  }
  let row = desktopRowGeometry(widths, viewport.scrollLeft, settings);
  let index = row.findIndex(card => card.left + card.width * card.scale > gutter + 1);
  if (index < 0) index = cards.length - 1;
  const canonical = middleRibbonIndex(index, ribbon.cycleLength);
  if (canonical !== index && !changing) {
    const oldScroll = viewport.scrollLeft;
    viewport.scrollLeft = before(canonical) + gutter - row[index].left;
    if (gesture?.axis === 'horizontal') gesture.scroll += viewport.scrollLeft - oldScroll;
    index = canonical;
    row = desktopRowGeometry(widths, viewport.scrollLeft, settings);
  }
  cards.forEach((card, i) => {
    const scale = String(row[i].scale);
    if (card.style.getPropertyValue('--drum-scale') !== scale) card.style.setProperty('--drum-scale', scale);
  });
  mobilePosition = index;
  syncRibbonCategory(index);
  positionAboutCopy(row, index, width);
}
function positionAboutCopy(row, index, width) {
  let nearest = -1;
  ribbon.items.forEach((item, i) => {
    if (item.kind === 'about' && (nearest < 0 || Math.abs(i - index) < Math.abs(nearest - index))) nearest = i;
  });
  if (nearest >= 0) aboutCopy.style.setProperty('--about-offset-x', `${row[nearest].left + row[nearest].width / 2 - width / 2}px`);
}
function scheduleLayout() { if (!frame) frame = requestAnimationFrame(layout); }

function stopMobileSlide() {
  cancelAnimationFrame(mobileSlideFrame);
  mobileSlideFrame = 0;
}
function centerMobileRibbon() {
  if (!ribbon.cycleLength) return;
  const index = Math.round(mobilePosition);
  mobilePosition += middleRibbonIndex(index, ribbon.cycleLength) - index;
}
function settleMobileProject(index) {
  stopMobileSlide();
  const target = Math.max(0, Math.min(track.children.length - 1, index));
  const from = mobilePosition;
  const overscroll = mobileOverscroll;
  const start = performance.now();
  const duration = reducedMotion.matches ? 0 : 180 + Math.min(140, Math.abs(target - from) * 140);
  function animate(now) {
    const progress = duration ? Math.min(1, (now - start) / duration) : 1;
    const eased = 1 - (1 - progress) ** 3;
    mobilePosition = from + (target - from) * eased;
    mobileOverscroll = overscroll * (1 - eased);
    mobileSlideFrame = progress < 1 ? requestAnimationFrame(animate) : 0;
    scheduleLayout();
  }
  mobileSlideFrame = requestAnimationFrame(animate);
}
function setSectionMotion(offset, opacity) {
  sectionOffset = offset;
  sectionOpacity = opacity;
  root.classList.add('section-motion');
  root.style.setProperty('--section-offset', `${offset}px`);
  root.style.setProperty('--section-opacity', String(opacity));
}
function stopSectionAnimation() {
  cancelAnimationFrame(sectionFrame);
  sectionFrame = 0;
  const resolve = sectionResolve;
  sectionResolve = null;
  resolve?.();
}
function resetSectionMotion() {
  stopSectionAnimation();
  root.classList.remove('section-motion');
  root.style.removeProperty('--section-offset');
  root.style.removeProperty('--section-opacity');
  sectionOffset = 0;
  sectionOpacity = 1;
}
function animateSection(offset, opacity, duration) {
  stopSectionAnimation();
  const from = sectionOffset;
  const fromOpacity = sectionOpacity;
  const start = performance.now();
  setSectionMotion(from, fromOpacity);
  return new Promise(resolve => {
    sectionResolve = resolve;
    function animate(now) {
      const progress = reducedMotion.matches ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setSectionMotion(from + (offset - from) * eased, fromOpacity + (opacity - fromOpacity) * eased);
      if (progress < 1) sectionFrame = requestAnimationFrame(animate);
      else { sectionFrame = 0; sectionResolve = null; resolve(); }
    }
    sectionFrame = requestAnimationFrame(animate);
  });
}

viewport.addEventListener('scroll', () => { scheduleLayout(); if (gesture?.axis !== 'tilt') resetCardTilt(); if (!mobile.matches) projectPreview.stop(); }, {passive:true});
viewport.addEventListener('focusin', event => {
  const card = event.target.closest('.project');
  if (mobile.matches && card?.matches(':focus-visible')) settleMobileProject([...track.children].indexOf(card));
});
window.addEventListener('resize', scheduleLayout);
mobile.addEventListener('change', () => {desktopJump = Math.round(mobilePosition);scheduleLayout();});
reducedMotion.addEventListener('change', scheduleLayout);

viewport.addEventListener('wheel', event => {
  if (menuOpen || dialog.open) return;
  event.preventDefault();
  const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
  const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
  const delta = (horizontal ? event.deltaX : event.deltaY) * multiplier;
  if (!delta) return;
  const now = performance.now();
  const axis = horizontal ? 'horizontal' : 'vertical';
  if (now - lastWheel > 180 || axis !== wheelAxis || Math.sign(delta) !== wheelDirection) {
    wheelTotal = 0;
    wheelCommitted = false;
  }
  lastWheel = now;
  wheelAxis = axis;
  wheelDirection = Math.sign(delta);
  if (horizontal && !mobile.matches) {
    if (!changing) viewport.scrollLeft += event.deltaX * multiplier;
    wheelTotal = 0;
    return;
  }
  // Ignore input during the transition without carrying a desktop lock into
  // the next section. Continuous wheel input can continue as soon as it ends.
  if (changing) { if (mobile.matches) wheelCommitted = true; return; }
  if (mobile.matches && wheelCommitted) return;
  wheelTotal += delta;
  if (Math.abs(wheelTotal) > 45) {
    const direction = Math.sign(wheelTotal);
    wheelTotal = 0;
    wheelCommitted = mobile.matches;
    if (horizontal) settleMobileProject(Math.round(mobilePosition) + direction);
    else stepCategory(direction);
  }
}, {passive:false});
root.addEventListener('pointerdown', event => {
  if (menuOpen || changing || dialog.open || event.button !== 0) return;
  if (event.target.closest('.menu,.site-logo,.camera-controls')) return;
  if (!event.isPrimary) { cancelGesture(); resetCardTilt(); if (mobile.matches) settleMobileProject(Math.round(mobilePosition)); return; }
  cancelGesture();
  resetSectionMotion();
  resetCardTilt();
  if (!mobile.matches) projectPreview.stop();
  if (mobile.matches) {stopMobileSlide();centerMobileRibbon();}
  const card = event.target.closest('.project');
  const index = Math.round(mobilePosition);
  const current = track.children[index]?.querySelector('.project-drum');
  const stride = (current ? parseFloat(getComputedStyle(current).width) : viewport.clientWidth) + 13;
  const pending = gesture = {id:event.pointerId, x:event.clientX, y:event.clientY, lastX:event.clientX, lastY:event.clientY, lastTime:performance.now(), velocityX:0, velocityY:0, scroll:viewport.scrollLeft, position:mobilePosition, index, stride, axis:null, card, holdTimer:0};
  if (mobile.matches && card && !reducedMotion.matches) {
    pending.holdTimer = setTimeout(() => {
      pending.holdTimer = 0;
      if (gesture !== pending || pending.axis || menuOpen || changing || !card.isConnected) return;
      pending.axis = 'tilt';
      hideFollower();
      root.setPointerCapture(pending.id);
      tiltCard(card, pending.lastX, pending.lastY, 5);
    }, 320);
  }
});
root.addEventListener('pointermove', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  const now = performance.now();
  const elapsed = Math.max(8, now - gesture.lastTime);
  gesture.velocityX = gesture.velocityX * 0.65 + (event.clientX - gesture.lastX) / elapsed * 0.35;
  gesture.velocityY = gesture.velocityY * 0.65 + (event.clientY - gesture.lastY) / elapsed * 0.35;
  gesture.lastX = event.clientX;
  gesture.lastY = event.clientY;
  gesture.lastTime = now;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  // A deliberate swipe still navigates after a brief hold on the card.
  if (gesture.axis === 'tilt' && Math.max(Math.abs(dx), Math.abs(dy)) <= 18) {
    event.preventDefault();
    tiltCard(gesture.card, event.clientX, event.clientY, 5);
    return;
  }
  if (gesture.axis === 'tilt') gesture.axis = null;
  if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
    clearTimeout(gesture.holdTimer);
    gesture.holdTimer = 0;
    gesture.axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    hideFollower();
    resetCardTilt();
    root.setPointerCapture(event.pointerId);
  }
  if (gesture.axis === 'horizontal') {
    event.preventDefault();
    if (mobile.matches) {
      const raw = gesture.position - dx / gesture.stride;
      const min = Math.max(0, gesture.index - 1);
      const max = Math.min(track.children.length - 1, gesture.index + 1);
      mobilePosition = Math.max(min, Math.min(max, raw));
      mobileOverscroll = Math.tanh((raw - mobilePosition) * gesture.stride / 160) * 24;
      scheduleLayout();
    } else viewport.scrollLeft = gesture.scroll - dx;
    suppressClickUntil = now + 350;
  }
  if (gesture.axis === 'vertical') {
    event.preventDefault();
    if (mobile.matches && !reducedMotion.matches) {
      const offset = Math.tanh(dy / 180) * 160;
      setSectionMotion(offset, Math.max(0.45, 1 - Math.abs(offset) / 240));
    }
  }
}, {passive:false});
function cancelGesture(keepSectionMotion = false) {
  if (!gesture) return;
  const previous = gesture;
  gesture = null;
  clearTimeout(previous.holdTimer);
  if (previous.axis === 'vertical' && !keepSectionMotion) resetSectionMotion();
  if (previous.axis) suppressClickUntil = performance.now() + 350;
  if (root.hasPointerCapture(previous.id)) root.releasePointerCapture(previous.id);
}
function endGesture(event) {
  if (!gesture || gesture.id !== event.pointerId) return;
  const previous = gesture;
  const {axis,x,y,index,stride,velocityX,velocityY,lastTime} = previous;
  const fresh = performance.now() - lastTime < 100;
  cancelGesture(true);
  resetCardTilt();
  if (event.type === 'pointercancel') {
    if (axis === 'horizontal' && mobile.matches) settleMobileProject(index);
    if (axis === 'vertical') animateSection(0, 1, 180).then(() => { if (!gesture) resetSectionMotion(); });
    return;
  }
  if (axis === 'vertical') {
    const distance = y - event.clientY;
    const direction = mobile.matches ? swipeStep(distance, fresh ? -velocityY : 0, viewport.clientHeight * 0.6) : Math.abs(distance) > 45 ? Math.sign(distance) : 0;
    if (direction) stepCategory(direction);
    else animateSection(0, 1, 180).then(() => { if (!gesture) resetSectionMotion(); });
  }
  if (axis === 'horizontal' && mobile.matches) {
    settleMobileProject(index + swipeStep(x - event.clientX, fresh ? -velocityX : 0, stride));
  }
}
root.addEventListener('pointerup', endGesture);
root.addEventListener('pointercancel', endGesture);
root.addEventListener('lostpointercapture', event => {
  // Touch implicitly captures the original button. Its lost-capture event
  // bubbles here when a swipe transfers capture to the screen; keep that swipe.
  if (event.target !== root || root.hasPointerCapture(event.pointerId)) return;
  if (gesture?.id === event.pointerId) { const index=gesture.index; cancelGesture(); resetCardTilt(); if (mobile.matches) settleMobileProject(index); }
});
viewport.addEventListener('contextmenu', event => {
  if (mobile.matches && event.target.closest('.project')) event.preventDefault();
});
window.addEventListener('pointerup', endGesture);
document.querySelector('.video-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { video.pause(); video.removeAttribute('src'); video.load(); videoFrame.removeAttribute('src'); syncSiteView(); scheduleLayout(); });
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom)dialog.close();}});

applyCategory(category);

let projectStorage;
try { projectStorage = window.localStorage; } catch {}
const projectsLoader = startProjectLoading({
  apiUrl:publicProjectsUrl(),
  snapshotUrl:new URL('./projects-snapshot.json',import.meta.url).href,
  storage:projectStorage,
  onProjects(list) {
    if (JSON.stringify(list) !== JSON.stringify(projects)) { projects = list; render(); }
    const announcement = document.querySelector('#category-announcement');
    announcement.classList.add('sr-only');
    announcement.textContent = `Категория ${sections.find(section => section.id === category)?.label || category}`;
  },
  onUnavailable() {
    document.querySelector('#category-announcement').classList.remove('sr-only');
    document.querySelector('#category-announcement').textContent = 'Не удалось загрузить проекты. Попробуйте обновить страницу.';
  },
});
function refreshProjects(){ if (!dialog.open && !changing) return projectsLoader.refresh(); }
window.addEventListener('pageshow',event=>{if(event.persisted)refreshProjects();});
window.addEventListener('focus',refreshProjects);
window.addEventListener('online',refreshProjects);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshProjects();});
document.fonts.ready.then(scheduleLayout);
