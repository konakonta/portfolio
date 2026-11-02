import {projectsForCategory} from './project-config.js?v=89652b9ea833';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Three identical cycles let the viewport move back into the middle cycle
// without replacing cards or exposing an end to the horizontal ribbon.
export function projectRibbon(projects, sections) {
  const cycle = [];
  const starts = {};
  for (const section of sections) {
    starts[section.id] = cycle.length;
    const categoryProjects = section.id === 'about' ? [] : projectsForCategory(projects, section.id);
    const list = section.id === 'recent' ? categoryProjects.slice(0, 5) : categoryProjects;
    if (!list.length) cycle.push({category:section.id, kind:section.id === 'about' ? 'about' : 'empty', projectIndex:0});
    else list.forEach((project, projectIndex) => cycle.push({category:section.id, kind:'project', project, projectIndex}));
  }
  const cycleLength = cycle.length;
  return {items:[...cycle, ...cycle, ...cycle], cycleLength, starts:Object.fromEntries(Object.entries(starts).map(([id, index]) => [id, index + cycleLength]))};
}

export function middleRibbonIndex(index, cycleLength) {
  return cycleLength ? cycleLength + ((index % cycleLength) + cycleLength) % cycleLength : 0;
}

export function desktopRowGeometry(widths, scrollLeft, {width, gutter, gap = 13, pages = [], reducedMotion = false}) {
  let left = gutter - scrollLeft;
  return widths.map((cardWidth, index) => {
    const progress = clamp(((left + cardWidth) / width - 0.62) / 0.38, 0, 1);
    const scale = reducedMotion || pages[index] ? 1 : 1 + 0.08 * Math.expm1(5 * progress) / Math.expm1(5);
    const card = {width:cardWidth, scale, left};
    left += cardWidth * scale + gap;
    return card;
  });
}

export function swipeStep(distance, velocity, extent) {
  if (Math.abs(distance) < 12) return 0;
  if (Math.abs(velocity) >= 0.35) return Math.sign(velocity) === Math.sign(distance) ? Math.sign(velocity) : 0;
  return Math.abs(distance) >= clamp(extent * 0.16, 32, 72) ? Math.sign(distance) : 0;
}

// Position is measured in cards, independently of changing cover widths.
// At every integer position the selected card is exactly at its format's gutter.
export function mobileRowGeometry(formats, position, {width, posterWidth, gap = 13, gutter = 14, landscapeGutter = 9, reducedMotion = false}) {
  if (!formats.length) return {offset: 0, cards: []};
  position = clamp(position, 0, formats.length - 1);
  const index = Math.floor(position);
  const fraction = position - index;
  // Paper's 390px mobile frame uses a 372px landscape cover (9px per side).
  const fitted = width - landscapeGutter * 2;
  const isLandscape = format => format === true || format === 'landscape';
  const isPage = format => format === 'about' || format === 'empty';
  const widths = formats.map(format => isPage(format) ? width : isLandscape(format) ? fitted : posterWidth);
  // Keep cover heights stable. Only the horizontal drum stretch changes, in
  // both directions, and its total increase never exceeds five percent.
  const scales = formats.map((format, i) => {
    const progress = clamp(Math.abs(i - position), 0, 1);
    const stretch = Math.expm1(5 * progress * progress) / Math.expm1(5);
    return reducedMotion || isPage(format) ? 1 : 1 + 0.05 * stretch;
  });
  const cardGutter = format => isPage(format) ? 0 : isLandscape(format) ? landscapeGutter : gutter;
  const selectedGutter = cardGutter(formats[index]) * (1 - fraction) + cardGutter(formats[index + 1]) * fraction;
  const offset = widths.slice(0, index).reduce((sum, item, i) => sum + item * scales[i] + gap, 0) + fraction * (widths[index] * scales[index] + gap) + gutter - selectedGutter;
  let left = gutter - offset;
  const cards = widths.map((cardWidth, index) => {
    const scale = scales[index];
    const card = {width: cardWidth, scale, left};
    left += cardWidth * scale + gap;
    return card;
  });
  return {offset, cards};
}
