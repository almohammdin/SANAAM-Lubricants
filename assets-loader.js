(()=>{
'use strict';
const V='20260819-6';
const sources={
  'assets/brand/sanaam-logo-original.webp':['asset-b64/logo.webp.b64','image/webp'],
  'assets/brand/favicon.png':['asset-b64/favicon.png.b64','image/png'],
  'assets/products/lineup.webp':['asset-b64/lineup.webp.b64','image/webp'],
  'assets/products/pack-1l.webp':['asset-b64/pack-1l.webp.b64','image/webp'],
  'assets/products/pack-4l.webp':['asset-b64/pack-4l.webp.b64','image/webp'],
  'assets/products/pack-5l.webp':['asset-b64/pack-5l.webp.b64','image/webp'],
  'assets/products/pack-20l.webp':['asset-b64/pack-20l.webp.b64','image/webp'],
  'assets/products/pack-200l.webp':['asset-b64/pack-200l.webp.b64','image/webp'],
  'assets/industry/base-oil.webp':['asset-b64/base-oil.webp.b64','image/webp'],
  'assets/industry/manufacturing.webp':['asset-b64/manufacturing.webp.b64','image/webp']
};
const cache=new Map();
const clean=v=>(v||'').split('?')[0];
async function dataUrl(path){
  path=clean(path);
  if(cache.has(path)) return cache.get(path);
  const def=sources[path]; if(!def) return null;
  const r=await fetch(def[0]+'?v='+V,{cache:'no-store'});
  if(!r.ok) throw new Error('missing '+def[0]);
  const b=(await r.text()).replace(/\s+/g,'');
  const u=`data:${def[1]};base64,${b}`;
  cache.set(path,u); return u;
}
async function hydrate(img){
  const p=img.dataset.assetPath||clean(img.getAttribute('src'));
  if(!sources[p]) return;
  try{const u=await dataUrl(p);if(u){img.src=u;img.removeAttribute('srcset');img.style.visibility='visible';img.classList.add('asset-ready');}}catch(e){
    if(p!=='assets/products/lineup.webp'&&p.startsWith('assets/products/')){
      try{img.src=await dataUrl('assets/products/lineup.webp');img.style.visibility='visible';}catch(_){img.style.visibility='visible';}
    }else img.style.visibility='visible';
  }
}
function hydrateTree(root=document){
  if(root instanceof HTMLImageElement) hydrate(root);
  root.querySelectorAll?.('img[src]').forEach(hydrate);
}
async function hydrateIcons(){
  try{const u=await dataUrl('assets/brand/favicon.png');document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(x=>x.href=u);}catch(e){}
}
function watch(){
  const mo=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)hydrateTree(n)})));
  mo.observe(document.documentElement,{childList:true,subtree:true});
}
async function init(){
  document.querySelectorAll('img[src]').forEach(img=>{const p=img.dataset.assetPath||clean(img.getAttribute('src'));if(sources[p])img.style.visibility='hidden';});
  await Promise.all(Object.keys(sources).map(p=>dataUrl(p).catch(()=>null)));
  hydrateTree(document);hydrateIcons();watch();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();