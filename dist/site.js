document.querySelectorAll('[data-video]').forEach(button=>{
  button.addEventListener('click',()=>{
    const id=button.dataset.video;
    if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
    const lang=button.dataset.language==='fr'?'fr':'en';
    const frame=document.createElement('iframe');
    frame.src=`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&hl=${lang}`;
    frame.title=lang==='fr'?'Démonstration Shupatto Compact M par Marna':'Shupatto Compact M demonstration by Marna';
    frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen=true;
    frame.referrerPolicy='strict-origin-when-cross-origin';
    frame.className='video-frame';
    button.replaceWith(frame);
    frame.focus();
  });
});

// Motion is a presentation preference held only for the current page.
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const motionControl=document.querySelector('[data-motion-toggle]');
const french=document.documentElement.lang==='fr';
let userPaused=motionPreference.matches;
function syncMotion(){
  const paused=userPaused||motionPreference.matches;
  document.documentElement.dataset.motion=paused?'paused':'running';
  if(!motionControl)return;
  motionControl.hidden=motionPreference.matches;
  motionControl.setAttribute('aria-pressed',String(paused));
  motionControl.setAttribute('aria-label',paused?(french?'Reprendre les animations':'Resume animations'):(french?'Mettre les animations en pause':'Pause animations'));
  motionControl.querySelector('span').textContent=paused?'▶':'Ⅱ';
}

// The edit is filterable without an account or persistent browser storage.
const selection=document.querySelector('[data-selection]');
if(selection){
  const products=[...selection.querySelectorAll('[data-product]')];
  const filterLinks=[...selection.querySelectorAll('[data-filter]')];
  const resultCount=selection.querySelector('[data-result-count]');
  const knownFilters=new Set(['all','under15','ready','bag','photos']);
  function updateSelection(){
    const requested=window.location.hash.slice(1);
    const filter=knownFilters.has(requested)?requested:'all';
    let count=0;
    for(const product of products){
      const visible=filter==='all'||(filter==='under15'?Number(product.dataset.price)<15:product.dataset.scene===filter);
      product.hidden=!visible;
      if(visible)count++;
    }
    for(const link of filterLinks){
      if(link.dataset.filter===filter)link.setAttribute('aria-current','true');
      else link.removeAttribute('aria-current');
    }
    if(resultCount)resultCount.textContent=french?`${count} trouvaille${count===1?'':'s'}`:`${count} find${count===1?'':'s'}`;
  }
  window.addEventListener('hashchange',updateSelection);
  updateSelection();
}
if(motionControl)motionControl.addEventListener('click',()=>{userPaused=!userPaused;syncMotion();});
if(typeof motionPreference.addEventListener==='function')motionPreference.addEventListener('change',()=>{userPaused=motionPreference.matches;syncMotion();});
syncMotion();
if('IntersectionObserver' in window&&!motionPreference.matches){
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      entry.target.classList.remove('reveal-waiting');
      entry.target.classList.add('reveal-visible');
      observer.unobserve(entry.target);
    }
  },{threshold:0.06,rootMargin:'0px 0px 25px 0px'});
  for(const node of document.querySelectorAll('[data-reveal]')){
    // Anything already on screen stays visible without a delayed entrance.
    if(node.getBoundingClientRect().top<window.innerHeight)continue;
    node.classList.add('reveal-waiting');
    observer.observe(node);
  }
}
