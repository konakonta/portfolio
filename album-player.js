import {BACKGROUND_LAYOUTS} from './background-layouts.js?v=d7081bcb6497';
import {collageRectangle} from './portfolio-background.js?v=d7081bcb6497';

export function createAlbumPlayback(button,audio,{onStart=()=>{},status}={}) {
  let requested=false;
  let generation=0;
  let press=null;
  function paint() {
    button.classList.toggle('is-playing',requested);
    button.setAttribute('aria-pressed',String(requested));
    button.setAttribute('aria-label',`${requested?'Выключить':'Включить'} Shabazz Palaces — Fast Learner`);
  }
  function stop() {
    generation++;
    requested=false;
    audio.pause();
    audio.currentTime=0;
    paint();
  }
  async function toggle() {
    if(button.disabled)return;
    if(requested){stop();return;}
    requested=true;
    const attempt=++generation;
    if(status)status.textContent='';
    paint();
    onStart();
    try {
      await audio.play();
      // A second tap can stop playback while the first play request is pending.
      if(attempt!==generation && !requested)audio.pause();
    } catch {
      if(attempt!==generation)return;
      stop();
      if(status)status.textContent='Не удалось включить трек. Нажмите на альбом ещё раз.';
    }
  }
  button.addEventListener('pointerdown',event=>{press={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};});
  button.addEventListener('pointermove',event=>{
    if(press?.id===event.pointerId && Math.hypot(event.clientX-press.x,event.clientY-press.y)>8)press.moved=true;
  });
  button.addEventListener('pointercancel',()=>{if(press)press.moved=true;});
  button.addEventListener('click',event=>{
    if(event.detail!==0 && press?.moved){event.preventDefault();return;}
    toggle();
  });
  audio.addEventListener('ended',stop);
  audio.addEventListener('error',()=>{
    if(!requested)return;
    stop();
    if(status)status.textContent='Не удалось загрузить трек. Нажмите на альбом ещё раз.';
  });
  audio.addEventListener('pause',()=>{
    if(!requested)return;
    generation++;
    requested=false;
    paint();
  });
  paint();
  return {stop,setView(active,blocked=false){button.disabled=!active || blocked;if(!active && requested)stop();}};
}

export function createAlbumPlayer(canvas,button,audio,mobile,options) {
  const playback=createAlbumPlayback(button,audio,options);
  const backgroundLayer=canvas.querySelector('.collage-layer--back');
  const foregroundAnchor=button.nextSibling;
  let showAbout=false;
  function place(size) {
    // In project sections the album belongs to the collage, rather than a
    // sibling stacking context above every background image.
    const parent=showAbout?canvas:backgroundLayer;
    if(button.parentElement!==parent){
      if(showAbout)canvas.insertBefore(button,foregroundAnchor);
      else backgroundLayer.append(button);
    }
    button.style.zIndex=showAbout?'':String(BACKGROUND_LAYOUTS.order[size].indexOf('back')+1);
  }
  function layout() {
    const size=mobile.matches?'mobile':'desktop';
    place(size);
    const rect=collageRectangle(BACKGROUND_LAYOUTS.album,size,canvas.clientWidth,canvas.clientHeight);
    button.style.width=`${rect.width}px`;
    button.style.height=`${rect.height}px`;
    button.style.transform=`translate(${rect.x}px,${rect.y}px) rotate(${rect.angle}deg)`;
  }
  new ResizeObserver(layout).observe(canvas);
  mobile.addEventListener('change',layout);
  layout();
  return {...playback,setView(active,blocked=false,visibleAbout=active){
    playback.setView(active,blocked);
    showAbout=visibleAbout;
    place(mobile.matches?'mobile':'desktop');
  }};
}
