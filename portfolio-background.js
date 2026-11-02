import {BACKGROUND_LAYOUTS} from './background-layouts.js?v=d7081bcb6497';

export function isIOSSafari({userAgent='',platform='',maxTouchPoints=0,standalone=false}={}) {
  const ios=/iPhone|iPad|iPod/.test(userAgent) || (platform==='MacIntel' && maxTouchPoints>1);
  return ios && !standalone && /Version\/[\d.]+.*Safari\//.test(userAgent)
    && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA|YaBrowser|Yowser|Brave/i.test(userAgent);
}

export function safariBackdropHeight(device={},viewport={}) {
  const width=Number(viewport.width) || 0;
  const height=Number(viewport.height) || 0;
  const sides=[Number(device.width),Number(device.height)];
  if(sides.some(side=>!Number.isFinite(side) || side<=0))return Math.ceil(height);
  // Safari's lvh can stop above the bottom toolbar. Screen dimensions also
  // cover that obscured area; normalize them for rotation on older iOS.
  const screenHeight=width>height?Math.min(...sides):Math.max(...sides);
  return Math.ceil(Math.max(height,screenHeight));
}

export function collageRectangle(image,size,width,height) {
  const [referenceWidth,referenceHeight]=BACKGROUND_LAYOUTS.reference[size];
  const scale=width/referenceWidth;
  let [x,y,w,h,angle]=image[size];
  let top=y/referenceHeight*height;
  // Bottom-anchored images follow the visible canvas as Safari's height changes.
  if(image.appearance?.[size]?.anchor==='bottom')top-=h*scale;
  if(image.extendedFrom && image.appearance?.[size]?.extended!==false) {
    // Preserve the former image's top edge and scale; only its bottom grows.
    const [oldWidth,oldHeight]=image.extendedFrom;
    const fit=Math.min(w/oldWidth,h/oldHeight);
    const drawnWidth=oldWidth*fit;
    const drawnHeight=oldHeight*fit;
    x+=(w-drawnWidth)/2;
    if(image.position==='50% 100%')top+=(h-drawnHeight)*scale;
    w=drawnWidth;
    h=drawnWidth*image.sourceSize[1]/image.sourceSize[0];
  }
  return {x:x*scale,y:top,width:w*scale,height:h*scale,angle};
}

export function createPortfolioBackground(element, mobile) {
  let category = 'about';
  let about = true;
  let resizeFrame = 0;
  let cursor = null;
  let touchId = null;
  const irisCenter = {x: 0, y: 0};
  const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const safari=isIOSSafari(globalThis.navigator);
  const canvas=element.parentElement ?? element;
  function pinVisibleCanvas() {
    // The taller document is only a backdrop. Focusing a control or restoring
    // a page must not scroll the interface into that extra background space.
    if(safari && mobile.matches && (window.scrollX || window.scrollY))window.scrollTo({left:0,top:0,behavior:'instant'});
  }
  function syncSafariBackdrop() {
    const active=safari && mobile.matches;
    document.documentElement.classList.toggle('ios-safari',active);
    if(active){
      const height=safariBackdropHeight(globalThis.screen,{width:window.innerWidth || canvas.clientWidth,height:window.innerHeight || canvas.clientHeight});
      document.documentElement.style.setProperty('--safari-screen-height',`${height}px`);
      document.documentElement.style.setProperty('--safari-bottom-extension',`${BACKGROUND_LAYOUTS.mobileBottomExtension * canvas.clientWidth / BACKGROUND_LAYOUTS.reference.mobile[0]}px`);
    }else {
      document.documentElement.style.removeProperty('--safari-screen-height');
      document.documentElement.style.removeProperty('--safari-bottom-extension');
    }
    const theme=document.querySelector?.('meta[name="theme-color"]');
    const color=active?'#262626':'#000000';
    if(theme && theme.getAttribute('content')!==color)theme.setAttribute('content',color);
  }
  syncSafariBackdrop();
  pinVisibleCanvas();
  window.addEventListener('scroll',pinVisibleCanvas,{passive:true});
  window.addEventListener('pageshow',pinVisibleCanvas,{passive:true});
  window.addEventListener('resize',syncSafariBackdrop,{passive:true});
  window.visualViewport?.addEventListener('resize',syncSafariBackdrop,{passive:true});
  const backLayer = document.createElement('div');
  const frontLayer = document.createElement('div');
  backLayer.className = 'collage-layer collage-layer--back';
  frontLayer.className = 'collage-layer collage-layer--front';
  element.append(backLayer, frontLayer);
  const layers = BACKGROUND_LAYOUTS.images.map(image => {
    const back = document.createElement('div');
    const front = document.createElement('div');
    for (const [layer, depth] of [[back, 'back'], [front, 'front']]) {
      layer.className = `collage-image collage-image--${depth}`;
      layer.dataset.image = image.id;
      const revision=image.revision?`?v=${image.revision}`:'';
      layer.style.backgroundImage = `url("./assets/collage/${encodeURIComponent(image.file)}${revision}")`;
      layer.style.backgroundSize = image.fit;
      layer.style.backgroundPosition = image.position;
    }
    backLayer.append(back);
    frontLayer.append(front);
    return {image, back, front};
  });
  const iris = layers.find(({image}) => image.id === 'iris');

  function moveIris() {
    const dx = cursor ? cursor.x - irisCenter.x : 0;
    const dy = cursor ? cursor.y - irisCenter.y : 0;
    const distance = Math.hypot(dx, dy);
    const scale = distance ? Math.min(1, 10 / distance) : 0;
    const offsetY = dy * scale * (dy < 0 ? 0.008 : 1);
    for (const layer of [iris.back, iris.front]) {
      layer.style.translate = `${dx * scale}px ${offsetY}px`;
    }
  }

  function resetIris() {
    cursor = null;
    touchId = null;
    moveIris();
  }

  document.addEventListener('pointerdown', event => {
    if (!mobile.matches || event.pointerType !== 'touch' || !event.isPrimary || reducedMotion.matches) return;
    touchId = event.pointerId;
    cursor = {x:event.clientX,y:event.clientY};
    moveIris();
  }, {passive:true});
  document.addEventListener('pointermove', event => {
    const mouse = event.pointerType === 'mouse' && hoverPointer.matches;
    const touch = mobile.matches && event.pointerType === 'touch' && event.pointerId === touchId;
    if ((!mouse && !touch) || reducedMotion.matches) return;
    cursor = {x: event.clientX, y: event.clientY};
    moveIris();
  }, {passive: true});
  function finishTouch(event) {if (event.pointerId === touchId) resetIris();}
  document.addEventListener('pointerup', finishTouch, {passive:true});
  document.addEventListener('pointercancel', finishTouch, {passive:true});
  document.documentElement.addEventListener('pointerleave', resetIris);
  window.addEventListener('blur', resetIris);
  hoverPointer.addEventListener('change', resetIris);
  reducedMotion.addEventListener('change', resetIris);

  function paint() {
    const size = mobile.matches ? 'mobile' : 'desktop';
    const [referenceWidth, referenceHeight] = BACKGROUND_LAYOUTS.reference[size];
    const width = element.clientWidth;
    // Safari's backdrop is taller than the visible canvas. Keep all anchors
    // tied to that visible canvas, so controls and the collage do not move.
    const height = canvas.clientHeight;
    const scale = width / referenceWidth;
    const foreground = BACKGROUND_LAYOUTS.foreground[size][category] || [];
    const behindProjects = BACKGROUND_LAYOUTS.behindProjects[size][category] || [];
    const order = BACKGROUND_LAYOUTS.order[size];
    element.dataset.section = about ? 'about' : category;
    for (const {image, back, front} of layers) {
      const rectangle = image[size];
      const highlighted = !about && foreground.includes(image.id);
      const behindCards = highlighted && behindProjects.includes(image.id);
      const promoted = highlighted && !behindCards;
      for (const layer of [back, front]) {
        // The portrait is the canvas ground, even in copies where it was moved above stickers.
        layer.style.zIndex = layer === back && behindCards
          ? String(order.length + 1)
          : image.id === 'portrait' ? '0' : String(order.indexOf(image.id) + 1);
        layer.hidden = !rectangle;
        if (!rectangle) continue;
        const rect=collageRectangle(image,size,width,height);
        layer.style.width = `${rect.width}px`;
        layer.style.height = `${rect.height}px`;
        layer.style.transform = `translate(${rect.x}px,${rect.y}px) rotate(${rect.angle}deg)`;
        const appearance=image.appearance?.[size];
        const extended=image.extendedFrom && appearance?.extended!==false;
        layer.style.backgroundSize=appearance?.fit ?? (extended?'100% 100%':image.fit);
        layer.style.backgroundPosition=appearance?.position ?? (extended?'50% 0%':image.position);
      }
      back.classList.toggle('is-color', about || (highlighted && !promoted));
      back.classList.toggle('is-promoted', promoted);
      front.classList.toggle('is-active', promoted);
    }
    const [x, y, w, h] = iris.image[size];
    const bounds = element.getBoundingClientRect();
    irisCenter.x = bounds.left + (x + w / 2) * scale;
    irisCenter.y = bounds.top + y / referenceHeight * height + h / 2 * scale;
    moveIris();
  }

  function schedulePaint() {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; paint(); });
  }
  const observer=new ResizeObserver(schedulePaint);
  observer.observe(element);
  if(canvas!==element)observer.observe(canvas);
  mobile.addEventListener('change', () => {syncSafariBackdrop();resetIris();schedulePaint();});
  paint();
  requestAnimationFrame(() => requestAnimationFrame(() => element.classList.add('collage-ready')));
  return {
    set(nextCategory, showAbout = nextCategory === 'about') {
      if (category === nextCategory && about === showAbout) return;
      category = nextCategory;
      about = showAbout;
      paint();
    }
  };
}
